# 🐳 RezervApp - Docker Deployment

Super simple Docker setup with one command!

## ☁️ One-Click Cloud Deploy

### Railway (Recommended - 1 Click!)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/RezervApp?referralCode=bonus)

**Free tier:** 500 hours/month, automatic HTTPS, custom domain

---

### Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Thsandorh/RezervApp)

**Free tier:** Automatic deployments, SSL included

---

## 🚀 Gyors Start (1 parancs!)

```bash
cd rezervapp
./start.sh
```

**Kész! 🎉** Megnyílik: http://localhost:3000

---

## 📋 Mi történik a háttérben?

A `start.sh` script automatikusan:
1. ✅ Ellenőrzi, hogy a Docker fut-e
2. ✅ Első futáskor létrehozza az adatbázist
3. ✅ Seedel demo adatokat
4. ✅ Elindítja az alkalmazást

---

## 🎯 Használat

### Első indítás után:

```bash
# Indítás
docker-compose up -d

# Leállítás
docker-compose down

# Logok megtekintése
docker-compose logs -f

# Újraindítás
docker-compose restart
```

---

## 🌐 URL-ek

- **Főoldal:** http://localhost:3000
- **Admin Login:** http://localhost:3000/login
- **Publikus Foglalás:** http://localhost:3000/book/pizzeria-romana

### 🔐 Demo Login

- **Email:** `admin@pizzeriaromana.hu`
- **Password:** `password123`

---

## ⚙️ Konfiguráció

### Environment változók módosítása

Szerkeszd a `docker-compose.yml` fájlt:

```yaml
environment:
  - DATABASE_URL=file:/app/data/dev.db
  - NEXTAUTH_SECRET=your-secret
  - NEXTAUTH_URL=http://localhost:3000
  - RESEND_API_KEY=your-resend-key  # Opcionális
```

### Port módosítása

A `docker-compose.yml`-ben:

```yaml
ports:
  - "8080:3000"  # Bal oldal = külső port
```

---

## 🗄️ Adatbázis

Az SQLite adatbázis a `data/` mappában van mentve:

```
rezervapp/
  ├── data/
  │   └── dev.db  ← Itt van az adatbázis
```

### Adatbázis törlése és újrakezdés

```bash
# Leállítás
docker-compose down

# Adatbázis törlése
rm -rf data/

# Újraindítás (új adatbázissal)
./start.sh
```

---

## 🔧 Troubleshooting

### "Docker nem fut" hiba

```bash
# Linux/macOS
sudo systemctl start docker

# Vagy egyszerűen indítsd el a Docker Desktop-ot
```

### Port már használatban

Ha a 3000-es port foglalt, módosítsd a `docker-compose.yml`-ben:

```yaml
ports:
  - "3001:3000"  # Most a 3001-en fog futni
```

### Build újrafuttatása

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 🌍 Production Deployment

### Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy
fly launch
```

### Digital Ocean / AWS / Azure

Használd a Docker image-et és deploy-old a választott platform-ra:

```bash
# Build image
docker build -t rezervapp .

# Tag and push
docker tag rezervapp your-registry/rezervapp:latest
docker push your-registry/rezervapp:latest
```

---

## 📦 Tartalom

- `Dockerfile` - Docker image konfiguráció
- `docker-compose.yml` - Docker Compose setup
- `.dockerignore` - Kizárt fájlok
- `start.sh` - Egyszerű indító script

---

## ✨ Előnyök

✅ **Egy parancs** - Minden automatikus
✅ **Izolált** - Nem kell Node.js/npm telepítés
✅ **Hordozható** - Bárhol fut (Windows/Mac/Linux)
✅ **Production-ready** - Ugyanez megy production-ben is

---

**Készítette:** [Thsandorh](https://github.com/Thsandorh)
