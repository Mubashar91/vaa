# Quick Deployment Commands

## Initial Setup (Run once on VPS)

```bash
# Upload setup script
scp backend/deployment/setup-server.sh root@YOUR_VPS_IP:/tmp/

# SSH into VPS
ssh root@YOUR_VPS_IP

# Run setup
chmod +x /tmp/setup-server.sh
bash /tmp/setup-server.sh

# Configure environment
nano /var/www/vaa-backend/backend/.env

# Restart app
pm2 restart vaa-backend
```

## GitHub Secrets to Configure

| Secret | Value |
|--------|-------|
| VPS_HOST | Your VPS IP or domain |
| VPS_USERNAME | SSH username (usually root) |
| VPS_SSH_KEY | Private SSH key content |

## Useful Commands

```bash
# View logs
pm2 logs vaa-backend

# Restart app
pm2 restart vaa-backend

# Check status
pm2 list

# Manual deploy
cd /var/www/vaa-backend/backend && bash deployment/deploy.sh

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# SSL setup
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
