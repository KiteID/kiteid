#!/usr/bin/env bash
# 03-cloudflared.sh — Cloudflare Tunnel setup for KiteID VPS
# Target: Ubuntu 24.04 LTS (arm64) — Hetzner CAX21
# Usage: ./03-cloudflared.sh <TUNNEL_TOKEN>
# Idempotent: recreates container with latest config

set -euo pipefail

TUNNEL_TOKEN="${1:?Usage: $0 <TUNNEL_TOKEN>}"

echo "==> [1/2] Starting cloudflared tunnel container"
docker rm -f cloudflared 2>/dev/null || true

# Routes are managed in CF Dashboard (Zero Trust > Tunnels > Public Hostname):
#   kiteid.xyz        -> http://dokploy-traefik:80   (main site)
#   admin.kiteid.xyz  -> http://dokploy:3000          (Dokploy UI — uses Docker service DNS)
#   status.kiteid.xyz -> http://dokploy-traefik:80   (status page, Phase 4)
# NOTE: cloudflared must be on dokploy-network to resolve Docker service names.
docker run -d \
  --name cloudflared \
  --restart unless-stopped \
  --network dokploy-network \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run --token "$TUNNEL_TOKEN"

echo "==> [2/2] Verification"
sleep 8
docker ps --filter name=cloudflared --format 'table {{.Names}}\t{{.Status}}'
echo ""
CONNS=$(docker logs cloudflared 2>&1 | grep -c "Registered tunnel connection")
echo "Tunnel connections established: $CONNS/4"
docker logs cloudflared 2>&1 | grep "Registered tunnel" | tail -2
