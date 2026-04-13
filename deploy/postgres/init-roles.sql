-- KiteID PostgreSQL role and schema initialization
-- Run as superuser (kiteid_admin) after database creation

-- Create roles (IF NOT EXISTS for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'kiteid_app') THEN
    CREATE ROLE kiteid_app WITH LOGIN PASSWORD 'CHANGE_ME_APP';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'kiteid_ponder') THEN
    CREATE ROLE kiteid_ponder WITH LOGIN PASSWORD 'CHANGE_ME_PONDER';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'kiteid_backup') THEN
    CREATE ROLE kiteid_backup WITH LOGIN REPLICATION PASSWORD 'CHANGE_ME_BACKUP';
  END IF;
END
$$;

-- Create schemas
CREATE SCHEMA IF NOT EXISTS ponder_index;

-- Grant permissions: kiteid_app
GRANT CONNECT ON DATABASE kiteid TO kiteid_app;
GRANT USAGE ON SCHEMA public TO kiteid_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kiteid_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kiteid_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO kiteid_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO kiteid_app;

-- kiteid_app: read-only on ponder_index
GRANT USAGE ON SCHEMA ponder_index TO kiteid_app;
GRANT SELECT ON ALL TABLES IN SCHEMA ponder_index TO kiteid_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA ponder_index GRANT SELECT ON TABLES TO kiteid_app;

-- Grant permissions: kiteid_ponder
GRANT CONNECT ON DATABASE kiteid TO kiteid_ponder;
GRANT USAGE, CREATE ON SCHEMA ponder_index TO kiteid_ponder;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ponder_index TO kiteid_ponder;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ponder_index TO kiteid_ponder;
ALTER DEFAULT PRIVILEGES IN SCHEMA ponder_index GRANT ALL PRIVILEGES ON TABLES TO kiteid_ponder;
ALTER DEFAULT PRIVILEGES IN SCHEMA ponder_index GRANT ALL PRIVILEGES ON SEQUENCES TO kiteid_ponder;

-- Grant permissions: kiteid_backup
GRANT CONNECT ON DATABASE kiteid TO kiteid_backup;
GRANT USAGE ON SCHEMA public TO kiteid_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO kiteid_backup;
GRANT USAGE ON SCHEMA ponder_index TO kiteid_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA ponder_index TO kiteid_backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO kiteid_backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA ponder_index GRANT SELECT ON TABLES TO kiteid_backup;
