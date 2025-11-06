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

## 🚀 Quick Start (1 command!)

```bash
cd rezervapp
./start.sh
```

**Done! 🎉** Opens at: http://localhost:3000

---

## 📋 What happens behind the scenes?

The `start.sh` script automatically:
1. ✅ Checks if Docker is running
2. ✅ Creates database on first run
3. ✅ Seeds demo data
4. ✅ Starts the application

---

## 🎯 Usage

### After first startup:

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart
```

---

## 🌐 URLs

- **Homepage:** http://localhost:3000
- **Admin Login:** http://localhost:3000/login
- **Public Booking:** http://localhost:3000/book/pizzeria-romana

### 🔐 Demo Login

- **Email:** `admin@pizzeriaromana.hu`
- **Password:** `password123`

---

## ⚙️ Configuration

### Modify environment variables

Edit `docker-compose.yml`:

```yaml
environment:
  - DATABASE_URL=file:/app/data/dev.db
  - NEXTAUTH_SECRET=your-secret
  - NEXTAUTH_URL=http://localhost:3000
  - RESEND_API_KEY=your-resend-key  # Optional
```

### Change port

In `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Left side = external port
```

---

## 🗄️ Database

SQLite database is saved in `data/` folder:

```
rezervapp/
  ├── data/
  │   └── dev.db  ← Database is here
```

### Reset database

```bash
# Stop
docker-compose down

# Delete database
rm -rf data/

# Restart (new database)
./start.sh
```

---

## 🔧 Troubleshooting

### "Docker not running" error

```bash
# Linux/macOS
sudo systemctl start docker

# Or simply start Docker Desktop
```

### Port already in use

If port 3000 is occupied, modify in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Will run on 3001
```

### Rebuild

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

Use Docker image and deploy to your chosen platform:

```bash
# Build image
docker build -t rezervapp .

# Tag and push
docker tag rezervapp your-registry/rezervapp:latest
docker push your-registry/rezervapp:latest
```

---

## 📦 Contents

- `Dockerfile` - Docker image configuration
- `docker-compose.yml` - Docker Compose setup
- `.dockerignore` - Excluded files
- `start.sh` - Simple startup script

---

## ✨ Advantages

✅ **One command** - Everything automatic
✅ **Isolated** - No need for Node.js/npm installation
✅ **Portable** - Runs anywhere (Windows/Mac/Linux)
✅ **Production-ready** - Same setup works in production

---

**Created by:** [Thsandorh](https://github.com/Thsandorh)
