#!/bin/bash

# Nanobanana Deployment Script
# This script helps deploy the application to Deno Deploy

echo "🍌 Nanobanana Deployment Script"
echo "================================"

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    echo "❌ Deno is not installed. Please install Deno first:"
    echo "curl -fsSL https://deno.land/install.sh | sh"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "main.ts" ]; then
    echo "❌ main.ts not found. Please run this script from the project root."
    exit 1
fi

# Install Deno Deploy CLI if not installed
if ! command -v deployctl &> /dev/null; then
    echo "📦 Installing Deno Deploy CLI..."
    deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts
fi

# Run tests
echo "🧪 Running tests..."
deno run --allow-net --allow-env test_server.ts &
TEST_PID=$!

# Wait a moment for server to start
sleep 2

# Test the server
echo "🔍 Testing server..."
curl -s http://localhost:8000/ > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server test passed"
else
    echo "⚠️  Server test failed, but continuing..."
fi

# Kill test server
kill $TEST_PID 2>/dev/null

# Deploy to Deno Deploy
echo "🚀 Deploying to Deno Deploy..."
echo "Make sure you're logged in to Deno Deploy:"
echo "1. Visit https://dash.deno.com/account"
echo "2. Login with your GitHub account"
echo "3. Run: deployctl login"
echo ""
read -p "Press Enter to continue with deployment..."

# Deploy the application
deployctl deploy --prod --project=nanobanana main.ts

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🎉 Your Nanobanana app is now live!"
else
    echo "❌ Deployment failed. Please check the error messages above."
fi