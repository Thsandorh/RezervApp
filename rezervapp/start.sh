#!/bin/bash

# RezervApp - Egyszerű Docker indító script
# Használat: ./start.sh

echo "🍽️  RezervApp - Docker Setup"
echo "=============================="
echo ""

# Ellenőrizzük, hogy Docker fut-e
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker nem fut! Kérlek indítsd el a Docker-t."
  exit 1
fi

# Első futáskor: adatbázis létrehozása
if [ ! -f "data/dev.db" ]; then
  echo "📦 Első indítás - Adatbázis létrehozása..."
  mkdir -p data

  # Prisma generálás és seed
  docker-compose run --rm rezervapp sh -c "
    npx prisma generate &&
    npx prisma db push --skip-generate &&
    npx prisma db seed
  "

  echo ""
  echo "✅ Adatbázis létrehozva és seedelt!"
  echo ""
fi

# Indítás
echo "🚀 RezervApp indítása..."
docker-compose up -d

echo ""
echo "✅ RezervApp fut!"
echo ""
echo "🌐 Nyisd meg: http://localhost:3000"
echo "👤 Admin login: admin@pizzeriaromana.hu / password123"
echo "📊 Publikus foglalás: http://localhost:3000/book/pizzeria-romana"
echo ""
echo "Logok megtekintése: docker-compose logs -f"
echo "Leállítás: docker-compose down"
