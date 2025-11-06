#!/bin/bash

# RezervApp - Automatic Environment Setup
# No manual configuration needed!

echo "🔧 Automatic environment setup..."

# Generate NEXTAUTH_SECRET if not set
if [ -z "$NEXTAUTH_SECRET" ]; then
  export NEXTAUTH_SECRET=$(openssl rand -base64 32)
  echo "✅ Generated NEXTAUTH_SECRET"
fi

# Set NEXTAUTH_URL based on environment
if [ -z "$NEXTAUTH_URL" ]; then
  if [ -n "$VERCEL_URL" ]; then
    export NEXTAUTH_URL="https://$VERCEL_URL"
  elif [ -n "$RAILWAY_PUBLIC_DOMAIN" ]; then
    export NEXTAUTH_URL="https://$RAILWAY_PUBLIC_DOMAIN"
  elif [ -n "$RENDER_EXTERNAL_URL" ]; then
    export NEXTAUTH_URL="$RENDER_EXTERNAL_URL"
  else
    export NEXTAUTH_URL="http://localhost:3000"
  fi
  echo "✅ Set NEXTAUTH_URL: $NEXTAUTH_URL"
fi

# Default DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/data/dev.db"
  echo "✅ Set DATABASE_URL"
fi

# Default AUTH_TRUST_HOST
if [ -z "$AUTH_TRUST_HOST" ]; then
  export AUTH_TRUST_HOST="true"
  echo "✅ Set AUTH_TRUST_HOST"
fi

echo "✅ Environment ready!"
