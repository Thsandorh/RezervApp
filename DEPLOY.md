# 🚀 RezervApp - Deployment Guide

## ☁️ Legegyszerűbb: Fly.io (AJÁNLOTT!)

**Miért Fly.io?**
- ✅ Teljesen INGYENES
- ✅ 3 parancs és kész
- ✅ Automatikus HTTPS
- ✅ Global CDN

### Telepítés (egyszer)

```bash
# Linux/macOS
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Deployment (3 parancs!)

```bash
# 1. Login (megnyit egy böngészőt)
fly auth login

# 2. Deploy!
cd rezervapp
fly launch --now

# KÉSZ! 🎉
```

Fly automatikusan:
- ✅ Felismeri a Dockerfile-t
- ✅ Létrehozza az app-ot
- ✅ Hozzáad egy persistent volume-ot az adatbázisnak
- ✅ Deploy-ol és ad egy URL-t (pl: rezervapp.fly.dev)

### Environment változók beállítása

```bash
fly secrets set NEXTAUTH_SECRET=$(openssl rand -base64 32)
fly secrets set NEXTAUTH_URL=https://your-app.fly.dev
```

### Újra deploy

```bash
fly deploy
```

---

## 🚂 Railway (alternatíva)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Init projekt
cd rezervapp
railway init

# 4. Deploy
railway up

# 5. URL generálás
railway domain
```

**Environment változók:**
```bash
railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)
railway variables set DATABASE_URL=file:/app/data/dev.db
```

---

## 🌐 Render (GUI alapú)

1. **Menj:** https://dashboard.render.com/
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

## 🐳 Docker (Saját szerver)

Ha van saját szervert (VPS, Hetzner, DigitalOcean):

```bash
# 1. SSH a szerverre
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

## 📱 Telefonról Deploy (Termux Android)

```bash
# 1. Install Termux from F-Droid
# 2. Install dependencies
pkg install git nodejs

# 3. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 4. Clone & deploy
git clone https://github.com/Thsandorh/RezervApp
cd RezervApp/rezervapp
fly auth login
fly launch --now
```

---

## 🔧 Post-Deployment Setup

### 1. Első belépés után:

Admin URL: `https://your-app.com/login`
- Email: `admin@pizzeriaromana.hu`
- Password: `password123`

### 2. Változtasd meg az admin jelszót!

### 3. Publikus booking URL:
```
https://your-app.com/book/pizzeria-romana
```

### 4. Hozz létre saját éttermet:
- Admin → Beállítások
- Módosítsd a restaurant slug-ot
- Új booking URL: `https://your-app.com/book/your-slug`

---

## 📊 Összehasonlítás

| Platform | Ingyenes | Egyszerűség | Idő |
|----------|----------|-------------|-----|
| **Fly.io** | ✅ Igen | ⭐⭐⭐⭐⭐ | 2 perc |
| Railway | ✅ 500h/hó | ⭐⭐⭐⭐ | 3 perc |
| Render | ✅ Igen | ⭐⭐⭐ | 5 perc |
| Docker (VPS) | ❌ VPS kell | ⭐⭐ | 10 perc |

---

## 💡 Tippek

### Költségek minimalizálása:
- Fly.io: 3 kis gépet ad ingyen (elég!)
- Railway: 500 óra/hó ingyen
- Render: Alszik 15 perc után (lassú első load)

### Production-ready checklist:
- [ ] Változtasd meg az admin jelszót
- [ ] Állítsd be a NEXTAUTH_SECRET-et erősre
- [ ] Add hozzá a RESEND_API_KEY-t email-hez
- [ ] Custom domain beállítása
- [ ] Regular backup az adatbázisról

---

## ❓ Troubleshooting

### "Database is locked" hiba
→ SQLite egyidejű írásokat nem tud. Production-ben használj PostgreSQL-t:
```bash
# Fly.io Postgres
fly postgres create

# Railway
railway add
→ választ Postgres
```

### App nem indul
```bash
fly logs  # Fly.io
railway logs  # Railway
```

---

**Ajánlott:** Kezdd **Fly.io**-val - 2 perc és megy! 🚀

```bash
fly auth login && cd rezervapp && fly launch --now
```
