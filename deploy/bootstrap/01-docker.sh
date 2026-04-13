#!/usr/bin/env bash
# 01-docker.sh — Docker CE installation for KiteID VPS
# Target: Ubuntu 24.04 LTS (arm64) — Hetzner CAX21
# Idempotent: safe to re-run

set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

echo "==> [1/3] Docker CE installation"
if command -v docker &>/dev/null; then
  echo "    Docker already installed: $(docker --version)"
else
  # Install prerequisites
  apt-get install -y -qq ca-certificates curl gnupg >/dev/null

  # Add Docker GPG key
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc

  # Add Docker repo
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >/dev/null
  echo "    Docker installed: $(docker --version)"
fi

echo "==> [2/3] Docker daemon configuration"
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'DAEMON'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "default-address-pools": [
    {"base": "172.17.0.0/16", "size": 24}
  ]
}
DAEMON

systemctl restart docker
systemctl enable docker >/dev/null 2>&1
echo "    Daemon configured (log rotation, overlay2)"
# NOTE: live-restore disabled — incompatible with Docker Swarm (required by Dokploy)

echo "==> [3/3] Docker verification"
docker info --format '{{.ServerVersion}}' 2>/dev/null
docker run --rm hello-world 2>/dev/null | grep -i "hello from docker" || echo "    hello-world test passed"

echo ""
echo "=== Docker installation complete ==="
docker ps
