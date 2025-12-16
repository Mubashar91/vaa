# VPS Deployment Guide

Complete guide for deploying the VAA backend application to a Hostinger VPS running Ubuntu with Nginx and GitHub Actions.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Hostinger VPS with Ubuntu (20.04 or later)
- ✅ Root or sudo access to the VPS
- ✅ Domain name (optional, but recommended)
- ✅ MongoDB database (MongoDB Atlas or self-hosted)
- ✅ GitHub repository access

## 🚀 Initial VPS Setup

### Step 1: Connect to Your VPS

```bash
ssh root@your-vps-ip
# Or if using a different user:
ssh username@your-vps-ip
```

### Step 2: Upload and Run Setup Script

On your **local machine**, upload the setup script to your VPS:

```bash
scp backend/deployment/setup-server.sh root@your-vps-ip:/tmp/
```

On your **VPS**, run the setup script:

```bash
chmod +x /tmp/setup-server.sh
bash /tmp/setup-server.sh
```

This script will:
- Install Node.js, npm, PM2, Nginx, and Git
- Configure firewall (UFW)
- Clone your repository
- Set up the application directory
- Configure Nginx
- Start the application with PM2

### Step 3: Configure Environment Variables

After the setup script completes, edit the `.env` file:

```bash
nano /var/www/vaa-backend/backend/.env
```

Update with your actual values:

```env
PORT=5001
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
ADMIN_TOKEN=your-very-secure-random-token-here
CORS_ORIGIN=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

**Important**: Generate a strong `ADMIN_TOKEN`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save and exit (Ctrl+X, then Y, then Enter).

### Step 4: Update Nginx Configuration

Edit the Nginx configuration to use your actual domain:

```bash
sudo nano /etc/nginx/sites-available/vaa-backend
```

Replace `your-domain.com` with your actual domain or VPS IP address.

Test Nginx configuration:
```bash
sudo nginx -t
```

Reload Nginx:
```bash
sudo systemctl reload nginx
```

### Step 5: Restart Application

```bash
cd /var/www/vaa-backend/backend
pm2 restart vaa-backend
pm2 save
```

### Step 6: Verify Deployment

Check if the application is running:

```bash
pm2 list
pm2 logs vaa-backend
```

Test the health endpoint:

```bash
curl http://localhost:5001/health
```

You should see: `{"ok":true}`

Test from outside (replace with your domain or IP):

```bash
curl http://your-domain.com/health
```

## 🔐 SSL Certificate Setup (Recommended)

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts:
1. Enter your email address
2. Agree to terms of service
3. Choose whether to redirect HTTP to HTTPS (recommended: Yes)

Certbot will automatically:
- Obtain the certificate
- Update Nginx configuration
- Set up auto-renewal

### Verify Auto-Renewal

```bash
sudo certbot renew --dry-run
```

### Update Nginx Configuration for SSL

The SSL configuration is already included in `nginx.conf` (commented out). After running Certbot, you can uncomment the SSL server block if needed, or Certbot will handle it automatically.

## 🔄 GitHub Actions Setup

### Step 1: Generate SSH Key for GitHub Actions

On your **VPS**, generate a new SSH key pair:

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions -N ""
```

Add the public key to authorized keys:

```bash
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
```

Display the private key (you'll need this for GitHub):

```bash
cat ~/.ssh/github-actions
```

Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`).

### Step 2: Configure GitHub Repository Secrets

Go to your GitHub repository:
1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**

Add the following secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `VPS_HOST` | Your VPS IP address or domain | `123.45.67.89` or `api.yourdomain.com` |
| `VPS_USERNAME` | SSH username | `root` or your username |
| `VPS_SSH_KEY` | Private SSH key from previous step | The entire key content |

### Step 3: Test GitHub Actions Deployment

1. Make a small change to any file in the `backend` folder
2. Commit and push to the `mubii` branch:

```bash
git add .
git commit -m "Test deployment"
git push origin mubii
```

3. Go to **Actions** tab in your GitHub repository
4. Watch the deployment workflow run
5. Verify successful deployment

## 📊 Monitoring and Maintenance

### View Application Logs

```bash
# Real-time logs
pm2 logs vaa-backend

# Last 100 lines
pm2 logs vaa-backend --lines 100

# Error logs only
pm2 logs vaa-backend --err

# Log files location
ls -lh /var/www/vaa-backend/backend/logs/
```

### PM2 Commands

```bash
# List all processes
pm2 list

# Restart application
pm2 restart vaa-backend

# Stop application
pm2 stop vaa-backend

# Start application
pm2 start vaa-backend

# Monitor resources
pm2 monit

# Show process details
pm2 show vaa-backend
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/vaa-backend-access.log

# View error logs
sudo tail -f /var/log/nginx/vaa-backend-error.log
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check running processes
htop  # Install with: sudo apt install htop
```

## 🔧 Troubleshooting

### Application Won't Start

1. Check PM2 logs:
   ```bash
   pm2 logs vaa-backend --lines 50
   ```

2. Verify environment variables:
   ```bash
   cat /var/www/vaa-backend/backend/.env
   ```

3. Check MongoDB connection:
   ```bash
   # Test from VPS
   curl -I "your-mongodb-connection-string"
   ```

4. Verify Node.js version:
   ```bash
   node --version  # Should be >= 18.0.0
   ```

### Nginx 502 Bad Gateway

1. Check if application is running:
   ```bash
   pm2 list
   curl http://localhost:5001/health
   ```

2. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/vaa-backend-error.log
   ```

3. Verify Nginx configuration:
   ```bash
   sudo nginx -t
   ```

### GitHub Actions Deployment Fails

1. Check GitHub Actions logs in the repository
2. Verify SSH connection from local machine:
   ```bash
   ssh -i path/to/private-key username@vps-ip
   ```

3. Ensure repository is accessible from VPS:
   ```bash
   cd /var/www/vaa-backend
   git pull origin mubii
   ```

### CORS Issues

Update the `CORS_ORIGIN` in `.env` file:

```bash
nano /var/www/vaa-backend/backend/.env
```

Add all frontend URLs (comma-separated):
```env
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,http://localhost:5173
```

Restart the application:
```bash
pm2 restart vaa-backend
```

### Port Already in Use

Check what's using port 5001:
```bash
sudo lsof -i :5001
```

Kill the process if needed:
```bash
sudo kill -9 <PID>
```

## 🔄 Manual Deployment

If you need to deploy manually without GitHub Actions:

```bash
cd /var/www/vaa-backend/backend
bash deployment/deploy.sh
```

## 📁 Directory Structure

```
/var/www/vaa-backend/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── deployment/
│   │   ├── nginx.conf
│   │   ├── setup-server.sh
│   │   └── deploy.sh
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── logs/
│   │   ├── out.log
│   │   ├── err.log
│   │   └── combined.log
│   ├── .env
│   ├── ecosystem.config.js
│   ├── package.json
│   └── server.js
├── frontend/
└── admin/
```

## 🔐 Security Best Practices

1. **Firewall**: Ensure UFW is enabled and only necessary ports are open
   ```bash
   sudo ufw status
   ```

2. **SSH**: Disable password authentication, use SSH keys only
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PasswordAuthentication no
   sudo systemctl restart sshd
   ```

3. **Updates**: Keep system packages updated
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Environment Variables**: Never commit `.env` file to Git
   ```bash
   # Ensure .env is in .gitignore
   echo ".env" >> .gitignore
   ```

5. **MongoDB**: Use strong passwords and enable IP whitelisting in MongoDB Atlas

6. **Admin Token**: Use a strong, randomly generated token

## 📞 Support

If you encounter issues:

1. Check the logs (PM2 and Nginx)
2. Verify all environment variables are set correctly
3. Ensure MongoDB is accessible from the VPS
4. Check firewall rules
5. Review GitHub Actions logs for deployment issues

## 🎉 Success Checklist

- [ ] VPS setup completed
- [ ] Application running with PM2
- [ ] Nginx configured and running
- [ ] SSL certificate installed (if using domain)
- [ ] Environment variables configured
- [ ] GitHub Actions secrets configured
- [ ] Deployment workflow tested
- [ ] Health endpoint accessible
- [ ] API endpoints working correctly
- [ ] Logs are being generated
- [ ] PM2 startup configured

---

**Congratulations!** Your backend is now deployed and ready for production! 🚀
