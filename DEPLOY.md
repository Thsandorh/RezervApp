# 🚀 RezervApp - Deployment Guide

## ☁️ Easiest: Fly.io (RECOMMENDED!)

**Why Fly.io?**
- ✅ Completely FREE
- ✅ 3 commands and done
- ✅ Automatic HTTPS
- ✅ Global CDN

### Installation (one-time)

```bash
# Linux/macOS
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Deployment (3 commands!)

```bash
# 1. Login (opens browser)
fly auth login

# 2. Deploy!
cd rezervapp
fly launch --now

# DONE! 🎉
```

Fly automatically:
- ✅ Detects Dockerfile
- ✅ Creates the app
- ✅ Adds persistent volume for database
- ✅ Deploys and gives you a URL (e.g., rezervapp.fly.dev)

### Set environment variables

```bash
fly secrets set NEXTAUTH_SECRET=$(openssl rand -base64 32)
fly secrets set NEXTAUTH_URL=https://your-app.fly.dev
```

### Redeploy

```bash
fly deploy
```

---

## 🚂 Railway (alternative)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Init project
cd rezervapp
railway init

# 4. Deploy
railway up

# 5. Generate URL
railway domain
```

**Environment variables:**
```bash
railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)
railway variables set DATABASE_URL=file:/app/data/dev.db
```

---

## 🌐 Render (GUI-based)

1. **Go to:** https://dashboard.render.com/
2. **New** → **Web Service**
3. **Connect GitHub repo:** `Thsandorh/RezervApp`
4. **Settings:**
   - Root Directory: `rezervapp`
   - Build Command: `docker build -t rezervapp .`
   - Start Command: `docker run -p 3000:3000 rezervapp`
5. **Environment Variables:**
   ```
   NEXTAUTH_SECRET=<generate-random>
   DATABASE_URL=file:/app/data/dev.db
   AUTH_TRUST_HOST=true
   ```
6. **Create Web Service** → Done! 🚀

---

## 🐳 Docker (Own Server)

If you have your own server (VPS, Hetzner, DigitalOcean):

```bash
# 1. SSH to server
ssh user@your-server.com

# 2. Clone repo
git clone https://github.com/Thsandorh/RezervApp.git
cd RezervApp/rezervapp

# 3. Start!
./start.sh
```

**Nginx reverse proxy (optional):**
```nginx
server {
    listen 80;
    server_name rezervapp.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📊 Comparison

| Platform | Free | Simplicity | Time |
|----------|------|------------|------|
| **Fly.io** | ✅ Yes | ⭐⭐⭐⭐⭐ | 2 min |
| Railway | ✅ 500h/mo | ⭐⭐⭐⭐ | 3 min |
| Render | ✅ Yes | ⭐⭐⭐ | 5 min |
| Docker (VPS) | ❌ Need VPS | ⭐⭐ | 10 min |

---

## 💡 Tips

### Minimize costs:
- Fly.io: 3 small machines free (enough!)
- Railway: 500 hours/month free
- Render: Sleeps after 15 min (slow first load)

### Production-ready checklist:
- [ ] Change admin password
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Add RESEND_API_KEY for emails
- [ ] Set up custom domain
- [ ] Regular database backups

---

## ❓ Troubleshooting

### "Database is locked" error
→ SQLite doesn't handle concurrent writes. Use PostgreSQL in production:
```bash
# Fly.io Postgres
fly postgres create

# Railway
railway add
→ select Postgres
```

### App won't start
```bash
fly logs  # Fly.io
railway logs  # Railway
```

---

**Recommended:** Start with **Fly.io** - 2 minutes and it works! 🚀

```bash
fly auth login && cd rezervapp && fly launch --now
```
