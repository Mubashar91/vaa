#!/bin/bash

# Manual Deployment Script
# Use this script to manually deploy updates to the VPS

set -e  # Exit on error

echo "🚀 Starting manual deployment..."

# Configuration
APP_DIR="/var/www/vaa-backend"

# Navigate to application directory
cd $APP_DIR

# Pull latest changes
echo "📥 Pulling latest code from Git..."
git pull origin mubii

# Navigate to backend directory
cd backend

# Install/update dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Restart application with PM2
echo "🔄 Restarting application..."
pm2 restart vaa-backend

# Save PM2 configuration
pm2 save

# Wait for application to start
sleep 5

# Health check
echo "🏥 Running health check..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health)

if [ "$HEALTH_STATUS" -eq 200 ]; then
    echo "✅ Deployment successful! Application is healthy."
    pm2 list
    pm2 logs vaa-backend --lines 20
else
    echo "❌ Deployment failed! Health check returned status: $HEALTH_STATUS"
    pm2 logs vaa-backend --lines 50
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
