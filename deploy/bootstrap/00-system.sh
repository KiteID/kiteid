#!/usr/bin/env bash
# 00-system.sh — OS hardening + swap for KiteID VPS
# Target: Ubuntu 24.04 LTS (arm64) — Hetzner CAX21
# Idempotent: safe to re-run
# Usage: SSH_ALLOW_IP=<your-ip> ./00-system.sh

set -euo pipefail

SSH_ALLOW_IP="${SSH_ALLOW_IP:-}"

echo "==> [1/8] Swap setup (2 GB)"
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "    Swap created and enabled"
else
  swapon /swapfile 2>/dev/null || true
  echo "    Swap already exists"
fi

echo "==> [2/8] System update"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq

echo "==> [3/8] Unattended-upgrades configuration"
apt-get install -y -qq unattended-upgrades apt-listchanges >/dev/null
cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'UUCFG'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}:${distro_codename}-updates";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";
UUCFG

cat > /etc/apt/apt.conf.d/20auto-upgrades << 'AUTOCFG'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
AUTOCFG
systemctl enable --now unattended-upgrades >/dev/null 2>&1
echo "    Unattended-upgrades configured (reboot at 04:00 UTC)"

echo "==> [4/8] UFW firewall"
apt-get install -y -qq ufw >/dev/null
ufw default deny incoming >/dev/null 2>&1
ufw default allow outgoing >/dev/null 2>&1
# Only allow SSH from specific IP if provided, else allow from anywhere (temporary)
if [ -n "$SSH_ALLOW_IP" ]; then
  ufw delete allow 22/tcp 2>/dev/null || true
  ufw allow from "$SSH_ALLOW_IP" to any port 22 proto tcp comment "SSH from operator IP" >/dev/null 2>&1
  echo "    SSH restricted to $SSH_ALLOW_IP"
else
  ufw allow 22/tcp comment 'SSH (restrict with SSH_ALLOW_IP)' >/dev/null 2>&1
  echo "    WARNING: SSH open to all — set SSH_ALLOW_IP to restrict"
fi
# NO inbound 80/443 rules — all HTTP(S) traffic arrives via Cloudflare Tunnel (outbound QUIC).
# Raw IP access to origin is blocked to prevent CF WAF/rate-limit bypass.
ufw --force enable >/dev/null 2>&1
echo "    UFW enabled (no inbound 80/443 — traffic via CF Tunnel only)"

echo "==> [5/8] Sysctl kernel hardening"
cat > /etc/sysctl.d/99-kiteid.conf << 'SYSCTL'
# KiteID VPS hardening — ADR-07
# IPv4
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
# IPv6
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv6.conf.default.accept_redirects = 0
net.ipv6.conf.default.accept_source_route = 0
# Kernel
kernel.kptr_restrict = 2
kernel.dmesg_restrict = 1
kernel.yama.ptrace_scope = 2
kernel.kexec_load_disabled = 1
# FS
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
fs.protected_fifos = 2
fs.protected_regular = 2
fs.suid_dumpable = 0
# Network buffers (cloudflared QUIC)
net.core.rmem_max = 7500000
net.core.wmem_max = 7500000
# Swap
vm.swappiness = 10
SYSCTL
sysctl --system >/dev/null 2>&1
echo "    Sysctl hardening applied"

echo "==> [6/8] Fail2ban"
apt-get install -y -qq fail2ban >/dev/null
cat > /etc/fail2ban/jail.local << 'F2B'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5
backend  = systemd

[sshd]
enabled = true
port    = ssh
filter  = sshd
maxretry = 3
bantime  = 24h
F2B
systemctl enable --now fail2ban >/dev/null 2>&1
echo "    Fail2ban enabled (SSH: 3 retries → 24h ban)"

echo "==> [7/8] Auditd"
apt-get install -y -qq auditd audispd-plugins >/dev/null 2>&1 || apt-get install -y -qq auditd >/dev/null 2>&1
cat > /etc/audit/rules.d/kiteid.rules << 'AUDIT'
# KiteID audit rules — key system paths
-w /etc/passwd -p wa -k identity
-w /etc/group -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/sudoers -p wa -k sudo_changes
-w /etc/sudoers.d/ -p wa -k sudo_changes
-w /etc/ssh/sshd_config -p wa -k sshd_config
-w /var/log/auth.log -p wa -k auth_log
-w /etc/crontab -p wa -k cron
-w /etc/cron.d/ -p wa -k cron
-w /usr/bin/ -p wa -k binaries
-w /usr/sbin/ -p wa -k binaries
AUDIT
systemctl enable --now auditd >/dev/null 2>&1
augenrules --load >/dev/null 2>&1 || true
echo "    Auditd enabled with KiteID rules"

echo "==> [8/8] Docker port lockdown (iptables DOCKER-USER)"
# Docker bypasses UFW via its own iptables chains (DOCKER chain).
# DOCKER-USER is the correct chain for custom firewall rules.
# Block ALL Docker-published ports from external access.
# Traffic arrives via Cloudflare Tunnel (cloudflared container on same Docker network).
apt-get install -y -qq iptables-persistent >/dev/null 2>&1

# Allow Docker-internal traffic (containers talking to each other)
for SUBNET in 127.0.0.0/8 172.16.0.0/12 10.0.0.0/8; do
  for PORT in 80 443 3000; do
    iptables -C DOCKER-USER -s "$SUBNET" -p tcp --dport "$PORT" -j ACCEPT 2>/dev/null || \
      iptables -I DOCKER-USER 1 -s "$SUBNET" -p tcp --dport "$PORT" -j ACCEPT
  done
done

# Drop all external access to these ports
for PORT in 80 443 3000; do
  iptables -C DOCKER-USER -p tcp --dport "$PORT" -j DROP 2>/dev/null || \
    iptables -A DOCKER-USER -p tcp --dport "$PORT" -j DROP
done

netfilter-persistent save >/dev/null 2>&1
echo "    Ports 80/443/3000 blocked externally, accessible via CF Tunnel only"

echo ""
echo "=== System Hardening Complete ==="
echo "Verification:"
swapon --show
ufw status numbered
sysctl net.ipv4.tcp_syncookies kernel.kptr_restrict fs.suid_dumpable 2>/dev/null
fail2ban-client status sshd 2>/dev/null | grep "Currently banned"
iptables -L DOCKER-USER -n 2>/dev/null | head -6 || echo "(DOCKER-USER chain — run after Docker install)"
