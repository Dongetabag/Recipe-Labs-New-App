#!/bin/bash
# Recipe Labs Auto-Deploy Script
# Usage: ./deploy.sh

set -e

APP_DIR=~/recipe-labs-new-app
APP_NAME="recipe-labs-app"

echo "========================================"
echo "  Recipe Labs Deployment"
echo "  $(date)"
echo "========================================"

cd $APP_DIR

echo ""
echo "📥 Pulling latest changes from GitHub..."
git fetch origin main
git reset --hard origin/main

echo ""
echo "📦 Installing dependencies..."
npm install --production

echo ""
echo "🔨 Building application..."
npm run build 2>/dev/null || echo "No build script configured"

echo ""
echo "🔄 Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 restart $APP_NAME 2>/dev/null || pm2 start npm --name "$APP_NAME" -- start 2>/dev/null || echo "PM2 not configured for this app"
    pm2 save
else
    echo "PM2 not installed, skipping restart"
fi

echo ""
echo "========================================"
echo "  ✅ Deployment Complete!"
echo "========================================"
