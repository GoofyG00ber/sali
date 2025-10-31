#!/bin/bash

# Admin System Setup and Test Script

echo "🚀 Setting up Admin System..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if admin credentials file exists
if [ ! -f "config/admin-credentials.ts" ]; then
    echo "⚠️  admin-credentials.ts not found!"
    echo "Creating from template..."
    cp config/admin-credentials.template.ts config/admin-credentials.ts
    echo "✅ Created config/admin-credentials.ts"
    echo "📝 Default password is: admin123"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the development servers:"
echo "      npm run dev:all"
echo ""
echo "   2. Access the admin panel:"
echo "      http://localhost:5173/admin"
echo ""
echo "   3. Login with:"
echo "      Password: admin123"
echo ""
echo "   4. IMPORTANT: Change the password after first login!"
echo ""
echo "🔧 Manual server start (if needed):"
echo "   Terminal 1: npm run dev"
echo "   Terminal 2: npm run food-server"
echo ""
