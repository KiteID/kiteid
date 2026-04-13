#!/usr/bin/env bash
# 02-dokploy.sh — Dokploy PaaS installation for KiteID VPS
# Target: Ubuntu 24.04 LTS (arm64) — Hetzner CAX21
# Requires: Docker CE installed (01-docker.sh)

set -euo pipefail

echo "==> [1/2] Dokploy installation"
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q dokploy; then
  echo "    Dokploy already running"
else
  # Official Dokploy installer
  curl -sSL https://dokploy.com/install.sh | sh
  echo "    Dokploy installed"
fi

echo "==> [2/2] Verification"
sleep 10
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | head -20
echo ""
echo "=== Dokploy installation complete ==="
echo "Access Dokploy UI at: http://95.216.142.116:3000"
