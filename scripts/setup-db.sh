#!/bin/bash

# Coeus Online Exams Database Setup Script
# This script helps set up the database for development

echo "🚀 Setting up Coeus Online Exams Database..."

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL first:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "  - Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

# Create database if it doesn't exist
echo "📊 Creating database..."
createdb coeus_online_exams 2>/dev/null || echo "Database already exists or permission denied"

# Generate Prisma client
echo "⚙️  Generating Prisma client..."
npx prisma generate

# Push database schema
echo "📈 Pushing database schema..."
npx prisma db push

# Seed database with sample data
echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Database setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update your .env.local with your actual database credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to see your application"
echo ""
echo "🔐 Default login credentials:"
echo "   Admin: admin@coeus.com / admin123"
echo "   Student: john.doe@student.com / student123"