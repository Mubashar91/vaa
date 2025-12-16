#!/bin/bash

# VPS Initial Setup Script for Ubuntu
# This script sets up the server environment for the Node.js backend application

set -e  # Exit on error

echo "🚀 Starting VPS setup for VAA Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/vaa-backend"
REPO_URL="https://github.com/Mubashar91/vaa.git"  # Update with your repo URL
DOMAIN="147.93.72.136"  # VPS IP address

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  App Directory: $APP_DIR"
echo "  Repository: $REPO_URL"
echo "  Domain: $DOMAIN"
echo ""

# Update system packages
echo -e "${GREEN}📦 Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y

# Install Node.js (using NodeSource repository for latest LTS)
echo -e "${GREEN}📦 Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
echo -e "${GREEN}✅ Node.js version:${NC}"
node --version
npm --version

# Install PM2 globally
echo -e "${GREEN}📦 Installing PM2...${NC}"
sudo npm install -g pm2

# Install Nginx
echo -e "${GREEN}📦 Installing Nginx...${NC}"
sudo apt install -y nginx

# Install Git (if not already installed)
echo -e "${GREEN}📦 Installing Git...${NC}"
sudo apt install -y git

# Configure firewall
echo -e "${GREEN}🔥 Configuring firewall (UFW)...${NC}"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status

# Create application directory
echo -e "${GREEN}📁 Creating application directory...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Clone repository
echo -e "${GREEN}📥 Cloning repository...${NC}"
if [ -d "$APP_DIR/.git" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd $APP_DIR
    git pull origin mubii
else
    git clone $REPO_URL $APP_DIR
fi

# Navigate to backend directory
cd $APP_DIR/backend

# Create logs directory
echo -e "${GREEN}📁 Creating logs directory...${NC}"
mkdir -p logs

# Install dependencies
echo -e "${GREEN}📦 Installing application dependencies...${NC}"
npm ci --production

# Create .env file
echo -e "${YELLOW}⚙️  Creating .env file...${NC}"
if [ ! -f .env ]; then
    cat > .env << EOF
PORT=5001
NODE_ENV=production
MONGO_URI=your-mongodb-connection-string
ADMIN_TOKEN=your-secure-admin-token
CORS_ORIGIN=https://your-frontend-domain.com
EOF
    echo -e "${RED}⚠️  IMPORTANT: Edit the .env file with your actual values!${NC}"
    echo "   Run: nano $APP_DIR/backend/.env"
else
    echo ".env file already exists, skipping..."
fi

# Configure Nginx
echo -e "${GREEN}🌐 Configuring Nginx...${NC}"
sudo cp $APP_DIR/backend/deployment/nginx.conf /etc/nginx/sites-available/vaa-backend

# Update domain in nginx config
sudo sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/vaa-backend

# Enable site
sudo ln -sf /etc/nginx/sites-available/vaa-backend /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo -e "${GREEN}🧪 Testing Nginx configuration...${NC}"
sudo nginx -t

# Restart Nginx
echo -e "${GREEN}🔄 Restarting Nginx...${NC}"
sudo systemctl restart nginx
sudo systemctl enable nginx

# Start application with PM2
echo -e "${GREEN}🚀 Starting application with PM2...${NC}"
cd $APP_DIR/backend
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
echo -e "${GREEN}⚙️  Configuring PM2 startup...${NC}"
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
pm2 save

# Display PM2 status
pm2 list

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Edit the .env file with your actual values:"
echo "   nano $APP_DIR/backend/.env"
echo ""
echo "2. Restart the application:"
echo "   pm2 restart vaa-backend"
echo ""
echo "3. (Optional) Set up SSL with Let's Encrypt:"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "4. Configure GitHub Secrets for CI/CD:"
echo "   - VPS_HOST: Your VPS IP or domain"
echo "   - VPS_USERNAME: Your SSH username"
echo "   - VPS_SSH_KEY: Your private SSH key"
echo ""
echo -e "${GREEN}🎉 Your backend is ready to deploy!${NC}"
