#!/usr/bin/env bash
# 04-postgres.sh — PostgreSQL 17 + PgBouncer + Dragonfly setup
# Target: Ubuntu 24.04 LTS (arm64) — Hetzner CAX21
# Requires: Docker CE + Dokploy installed (for dokploy-network)
#
# CREDENTIALS: Pass via env vars. On first run, generates random passwords
# and persists to /opt/kiteid/.db-credentials. On re-run, reads from file.
# To force password rotation: delete /opt/kiteid/.db-credentials and re-run.

set -euo pipefail

CRED_FILE="/opt/kiteid/.db-credentials"

# Load or generate credentials
if [ -f "$CRED_FILE" ]; then
  echo "==> Loading existing credentials from $CRED_FILE"
  source "$CRED_FILE"
else
  echo "==> Generating new credentials"
  ADMIN_PASS="${KITEID_ADMIN_PASS:-$(openssl rand -base64 24)}"
  APP_PASS="${KITEID_APP_PASS:-$(openssl rand -base64 24)}"
  PONDER_PASS="${KITEID_PONDER_PASS:-$(openssl rand -base64 24)}"
  BACKUP_PASS="${KITEID_BACKUP_PASS:-$(openssl rand -base64 24)}"

  mkdir -p /opt/kiteid
  cat > "$CRED_FILE" << CREDS
ADMIN_PASS="$ADMIN_PASS"
APP_PASS="$APP_PASS"
PONDER_PASS="$PONDER_PASS"
BACKUP_PASS="$BACKUP_PASS"
CREDS
  chmod 600 "$CRED_FILE"
  echo "    Credentials saved to $CRED_FILE (chmod 600)"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"
PG_CONF="$DEPLOY_DIR/postgres/postgresql.conf"
INIT_SQL="$DEPLOY_DIR/postgres/init-roles.sql"

echo "==> [1/7] Creating Docker network: db-private"
docker network create db-private 2>/dev/null || echo "    Network already exists"

echo "==> [2/7] PostgreSQL 17"
if docker ps -a --format '{{.Names}}' | grep -q '^kiteid-postgres$'; then
  echo "    Container already exists, skipping create"
else
  mkdir -p /opt/kiteid/postgres/data /opt/kiteid/postgres/config

  # Use tracked config if available, else inline fallback
  if [ -f "$PG_CONF" ]; then
    cp "$PG_CONF" /opt/kiteid/postgres/config/postgresql.conf
    echo "    Using tracked postgresql.conf from $PG_CONF"
  else
    echo "    WARNING: $PG_CONF not found, using inline config"
    cat > /opt/kiteid/postgres/config/postgresql.conf << 'PGCONF'
shared_buffers = 1GB
effective_cache_size = 3GB
work_mem = 48MB
maintenance_work_mem = 256MB
max_connections = 100
superuser_reserved_connections = 3
wal_compression = on
wal_buffers = 16MB
max_wal_size = 2GB
min_wal_size = 128MB
random_page_cost = 1.1
effective_io_concurrency = 200
max_worker_processes = 4
max_parallel_workers_per_gather = 2
max_parallel_workers = 4
max_parallel_maintenance_workers = 2
autovacuum_naptime = 30s
autovacuum_vacuum_cost_limit = 2000
autovacuum_max_workers = 3
log_min_duration_statement = 500
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0
log_timezone = 'UTC'
timezone = 'UTC'
track_activities = on
track_counts = on
track_io_timing = on
listen_addresses = '*'
PGCONF
  fi

  docker run -d \
    --name kiteid-postgres \
    --network db-private \
    --restart unless-stopped \
    -e POSTGRES_USER=kiteid_admin \
    -e POSTGRES_PASSWORD="$ADMIN_PASS" \
    -e POSTGRES_DB=kiteid \
    -v /opt/kiteid/postgres/data:/var/lib/postgresql/data \
    -v /opt/kiteid/postgres/config/postgresql.conf:/etc/postgresql/postgresql.conf:ro \
    --memory 1400m \
    --cpus 2 \
    postgres:17-alpine \
    -c 'config_file=/etc/postgresql/postgresql.conf'

  echo "    PostgreSQL 17 started"
  sleep 10
fi

echo "==> [3/7] Initialize roles and schemas"
for i in $(seq 1 30); do
  if docker exec kiteid-postgres pg_isready -U kiteid_admin -d kiteid >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

# Use tracked SQL if available, else inline
if [ -f "$INIT_SQL" ]; then
  echo "    Using tracked init-roles.sql from $INIT_SQL"
  # Substitute passwords into SQL template
  sed "s/CHANGE_ME_APP/$APP_PASS/g; s/CHANGE_ME_PONDER/$PONDER_PASS/g; s/CHANGE_ME_BACKUP/$BACKUP_PASS/g" \
    "$INIT_SQL" | docker exec -i kiteid-postgres psql -U kiteid_admin -d kiteid
else
  echo "    Using inline SQL (init-roles.sql not found)"
  docker exec kiteid-postgres psql -U kiteid_admin -d kiteid -c "
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'kiteid_app') THEN
      CREATE ROLE kiteid_app WITH LOGIN PASSWORD '$APP_PASS';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'kiteid_ponder') THEN
      CREATE ROLE kiteid_ponder WITH LOGIN PASSWORD '$PONDER_PASS';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'kiteid_backup') THEN
      CREATE ROLE kiteid_backup WITH LOGIN REPLICATION PASSWORD '$BACKUP_PASS';
    END IF;
  END
  \$\$;
  CREATE SCHEMA IF NOT EXISTS ponder_index;
  GRANT CONNECT ON DATABASE kiteid TO kiteid_app;
  GRANT USAGE ON SCHEMA public TO kiteid_app;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kiteid_app;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kiteid_app;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO kiteid_app;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO kiteid_app;
  GRANT USAGE ON SCHEMA ponder_index TO kiteid_app;
  GRANT SELECT ON ALL TABLES IN SCHEMA ponder_index TO kiteid_app;
  ALTER DEFAULT PRIVILEGES IN SCHEMA ponder_index GRANT SELECT ON TABLES TO kiteid_app;
  GRANT CONNECT ON DATABASE kiteid TO kiteid_ponder;
  GRANT USAGE, CREATE ON SCHEMA ponder_index TO kiteid_ponder;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ponder_index TO kiteid_ponder;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ponder_index TO kiteid_ponder;
  ALTER DEFAULT PRIVILEGES IN SCHEMA ponder_index GRANT ALL PRIVILEGES ON TABLES TO kiteid_ponder;
  ALTER DEFAULT PRIVILEGES IN SCHEMA ponder_index GRANT ALL PRIVILEGES ON SEQUENCES TO kiteid_ponder;
  GRANT CONNECT ON DATABASE kiteid TO kiteid_backup;
  GRANT USAGE ON SCHEMA public TO kiteid_backup;
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO kiteid_backup;
  GRANT USAGE ON SCHEMA ponder_index TO kiteid_backup;
  GRANT SELECT ON ALL TABLES IN SCHEMA ponder_index TO kiteid_backup;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO kiteid_backup;
  ALTER DEFAULT PRIVILEGES IN SCHEMA ponder_index GRANT SELECT ON TABLES TO kiteid_backup;
  "
fi
echo "    Roles and schemas initialized"

echo "==> [4/7] Extract SCRAM hashes for PgBouncer"
SCRAM_HASHES=$(docker exec kiteid-postgres psql -U kiteid_admin -d kiteid -t -A -c \
  "SELECT '\"' || usename || '\" \"' || passwd || '\"' FROM pg_shadow WHERE usename LIKE 'kiteid_%';")
echo "    SCRAM-SHA-256 hashes extracted"

echo "==> [5/7] PgBouncer"
mkdir -p /opt/kiteid/pgbouncer
cat > /opt/kiteid/pgbouncer/pgbouncer.ini << 'PGBCFG'
[databases]
kiteid = host=kiteid-postgres port=5432 dbname=kiteid

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 200
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 3
server_lifetime = 3600
server_idle_timeout = 600
log_connections = 1
log_disconnections = 1
stats_period = 60
admin_users = kiteid_admin
PGBCFG

echo "$SCRAM_HASHES" > /opt/kiteid/pgbouncer/userlist.txt
chmod 644 /opt/kiteid/pgbouncer/userlist.txt

if docker ps -a --format '{{.Names}}' | grep -q '^kiteid-pgbouncer$'; then
  docker restart kiteid-pgbouncer
  echo "    PgBouncer restarted with updated config"
else
  docker run -d \
    --name kiteid-pgbouncer \
    --network db-private \
    --restart unless-stopped \
    -v /opt/kiteid/pgbouncer/pgbouncer.ini:/etc/pgbouncer/pgbouncer.ini:ro \
    -v /opt/kiteid/pgbouncer/userlist.txt:/etc/pgbouncer/userlist.txt:ro \
    --memory 100m \
    --cpus 0.5 \
    edoburu/pgbouncer:latest
  echo "    PgBouncer started (scram-sha-256, transaction mode)"
fi
sleep 3

echo "==> [6/7] Dragonfly (Redis-compatible cache)"
if docker ps -a --format '{{.Names}}' | grep -q '^kiteid-dragonfly$'; then
  echo "    Container already exists, skipping create"
else
  mkdir -p /opt/kiteid/dragonfly/data
  # Dragonfly requires minimum 256MB per proactor thread
  docker run -d \
    --name kiteid-dragonfly \
    --network db-private \
    --restart unless-stopped \
    -v /opt/kiteid/dragonfly/data:/data \
    --memory 350m \
    --cpus 1 \
    docker.dragonflydb.io/dragonflydb/dragonfly:latest \
    --maxmemory 256mb \
    --dir /data \
    --proactor_threads 1
  echo "    Dragonfly started (256 MB, 1 thread)"
  sleep 3
fi

echo "==> [7/7] Connect containers to dokploy-network"
docker network connect dokploy-network kiteid-postgres 2>/dev/null || true
docker network connect dokploy-network kiteid-pgbouncer 2>/dev/null || true
docker network connect dokploy-network kiteid-dragonfly 2>/dev/null || true
echo "    Networks connected"

echo ""
echo "=== DB Stack Complete ==="
echo ""
echo "Credentials (from $CRED_FILE):"
echo "  Admin:   kiteid_admin / $ADMIN_PASS"
echo "  App:     kiteid_app / $APP_PASS"
echo "  Ponder:  kiteid_ponder / $PONDER_PASS"
echo "  Backup:  kiteid_backup / $BACKUP_PASS"
echo ""
echo "Connection strings (from dokploy-network containers):"
echo "  Via PgBouncer:   postgres://kiteid_app:<pass>@kiteid-pgbouncer:6432/kiteid"
echo "  Dragonfly:       redis://kiteid-dragonfly:6379"
echo ""
echo "Verification:"
docker exec kiteid-postgres pg_isready -U kiteid_admin -d kiteid
docker exec kiteid-dragonfly redis-cli PING 2>/dev/null || echo "(Dragonfly starting...)"
docker ps --filter name=kiteid --format 'table {{.Names}}\t{{.Status}}'
