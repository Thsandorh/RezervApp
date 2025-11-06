#!/bin/sh
set -e

# RezervApp - Zero-Config Entrypoint
# Automatically sets up everything!

echo "🚀 RezervApp Starting..."

# Generate NEXTAUTH_SECRET if not provided
if [ -z "$NEXTAUTH_SECRET" ]; then
  export NEXTAUTH_SECRET=$(openssl rand -base64 32)
  echo "✅ Auto-generated NEXTAUTH_SECRET"
fi

# Auto-detect platform and set NEXTAUTH_URL
if [ -z "$NEXTAUTH_URL" ]; then
  if [ -n "$VERCEL_URL" ]; then
    export NEXTAUTH_URL="https://$VERCEL_URL"
    echo "✅ Detected Vercel: $NEXTAUTH_URL"
  elif [ -n "$RAILWAY_PUBLIC_DOMAIN" ]; then
    export NEXTAUTH_URL="https://$RAILWAY_PUBLIC_DOMAIN"
    echo "✅ Detected Railway: $NEXTAUTH_URL"
  elif [ -n "$RENDER_EXTERNAL_URL" ]; then
    export NEXTAUTH_URL="$RENDER_EXTERNAL_URL"
    echo "✅ Detected Render: $NEXTAUTH_URL"
  elif [ -n "$FLY_APP_NAME" ]; then
    export NEXTAUTH_URL="https://${FLY_APP_NAME}.fly.dev"
    echo "✅ Detected Fly.io: $NEXTAUTH_URL"
  else
    export NEXTAUTH_URL="http://localhost:3000"
    echo "✅ Using localhost"
  fi
fi

# Set defaults
export AUTH_TRUST_HOST="${AUTH_TRUST_HOST:-true}"
export DATABASE_URL="${DATABASE_URL:-file:/app/data/dev.db}"
export NODE_ENV="${NODE_ENV:-production}"

# Initialize database on first run
if [ ! -f "/app/data/dev.db" ]; then
  echo "📦 First run - Initializing database..."
  mkdir -p /app/data

  # Run Prisma setup
  npx prisma db push --skip-generate
  npx prisma db seed || echo "⚠️ Seed failed (might be already seeded)"

  echo "✅ Database initialized!"
fi

echo "✅ All set! Starting server..."
echo ""

# Start the application
exec node server.js
