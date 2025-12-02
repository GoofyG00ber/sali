#!/bin/bash

# This script sets up a local PHP server to test the production build

echo "Setting up production test environment..."

# Copy built files to a test directory
rm -rf dist-test
mkdir -p dist-test

# Copy built frontend from dist/
cp -r dist/* dist-test/

# Copy PHP API files
cp -r public/api dist-test/
cp public/.htaccess dist-test/
cp public/send-email.php dist-test/
cp public/router.php dist-test/

# Copy static images if they exist
if [ -d "public/static_images" ]; then
    cp -r public/static_images dist-test/
fi

echo ""
echo "✓ Files copied to dist-test/"
echo ""
echo "Starting PHP development server on http://localhost:8080"
echo "Press Ctrl+C to stop the server"
echo ""

# Start PHP built-in server with router
cd dist-test
php -S localhost:8080 router.php
