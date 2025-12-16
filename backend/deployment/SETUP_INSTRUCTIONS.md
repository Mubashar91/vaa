# Quick Setup Instructions for VPS: 147.93.72.136

## Step 1: Upload Setup Script to VPS

From your local machine (Windows), run:

```powershell
# Using SCP (if you have it installed)
scp backend/deployment/setup-server.sh root@147.93.72.136:/tmp/

# Or using PSCP (PuTTY's SCP tool)
pscp backend\deployment\setup-server.sh root@147.93.72.136:/tmp/
```

## Step 2: Connect to VPS

```powershell
ssh root@147.93.72.136
```

## Step 3: Run Setup Script

Once connected to the VPS:

```bash
chmod +x /tmp/setup-server.sh
bash /tmp/setup-server.sh
```

The script will:
- Install Node.js, npm, PM2, Nginx, Git
- Configure firewall
- Clone your repository
- Set up the application
- Start the backend with PM2

## Step 4: Configure Environment Variables

After setup completes:

```bash
nano /var/www/vaa-backend/backend/.env
```

Update these values:

```env
PORT=5001
NODE_ENV=production
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/donva?retryWrites=true&w=majority
ADMIN_TOKEN=your-secure-admin-token-here
CORS_ORIGIN=http://147.93.72.136,http://localhost:5173
```

**Generate a secure ADMIN_TOKEN:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

## Step 5: Restart Application

```bash
pm2 restart vaa-backend
pm2 save
```

## Step 6: Verify Deployment

Check if the app is running:

```bash
pm2 list
pm2 logs vaa-backend --lines 20
```

Test the health endpoint:

```bash
curl http://localhost:5001/health
```

Test from outside (from your local machine):

```powershell
curl http://147.93.72.136/health
```

You should see: `{"ok":true}`

## Step 7: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Value |
|------------|-------|
| `VPS_HOST` | `147.93.72.136` |
| `VPS_USERNAME` | `root` |
| `VPS_SSH_KEY` | Your private SSH key (see below) |

### Generate SSH Key for GitHub Actions

On your VPS:

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions -N ""
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github-actions
```

Copy the entire private key output (including BEGIN and END lines) and paste it as the `VPS_SSH_KEY` secret.

## Step 8: Test Automated Deployment

From your local machine:

```bash
git add .
git commit -m "Test deployment to VPS"
git push origin mubii
```

Watch the deployment in GitHub Actions tab!

## Useful Commands

```bash
# View logs
pm2 logs vaa-backend

# Restart app
pm2 restart vaa-backend

# Check status
pm2 list

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/vaa-backend-access.log
sudo tail -f /var/log/nginx/vaa-backend-error.log
```

## Access Your Backend

- **Health Check**: http://147.93.72.136/health
- **API Base URL**: http://147.93.72.136/api/
- **Example**: http://147.93.72.136/api/pricing

## Optional: Set Up Domain

If you have a domain name, you can:

1. Point your domain's A record to `147.93.72.136`
2. Update Nginx configuration:
   ```bash
   sudo nano /etc/nginx/sites-available/vaa-backend
   # Change server_name to your domain
   ```
3. Set up SSL:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

## Troubleshooting

If you encounter issues:

1. **Check PM2 logs**: `pm2 logs vaa-backend --lines 50`
2. **Check Nginx logs**: `sudo tail -f /var/log/nginx/vaa-backend-error.log`
3. **Verify MongoDB connection**: Make sure your MongoDB Atlas allows connections from `147.93.72.136`
4. **Check firewall**: `sudo ufw status`
5. **Restart services**:
   ```bash
   pm2 restart vaa-backend
   sudo systemctl restart nginx
   ```

---

**Your VPS is ready!** 🚀

Backend will be accessible at: **http://147.93.72.136**
