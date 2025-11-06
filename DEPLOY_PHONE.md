# 📱 RezervApp - Deploy Telefonról (Kattintással!)

## 🎯 Vercel - Legegyszerűbb (100% Webes!)

### 1️⃣ GitHub Fiók

Ha még nincs:
👉 https://github.com/signup

### 2️⃣ Vercel Regisztráció

👉 https://vercel.com/signup

**Kattints:** "Continue with GitHub"

✅ Engedélyezd a hozzáférést

### 3️⃣ Deploy

**A.) Vercel Dashboard-on:**

1. Kattints: **"Add New..." → "Project"**
2. Válaszd ki: **"Import Git Repository"**
3. Keress rá: `RezervApp`
4. Kattints: **"Import"**

**B.) Beállítások (FONTOS!):**

```
Root Directory: rezervapp
```
☝️ **Ez NAGYON fontos!** Írd be: `rezervapp`

**C.) Environment Variables:**

Kattints: "Environment Variables" +

```
DATABASE_URL = file:./dev.db
NEXTAUTH_SECRET = (kattints: "Generate" vagy írj be egy random 32 karaktert)
NEXTAUTH_URL = https://your-app.vercel.app (később átírod!)
AUTH_TRUST_HOST = true
```

**D.) Deploy!**

Kattints: **"Deploy"** 🚀

---

## ⏱️ Várj 2-3 percet...

Vercel:
- ✅ Build-eli az app-ot
- ✅ Deploy-ol
- ✅ Ad egy URL-t (pl: rezervapp.vercel.app)

---

## 4️⃣ Post-Deploy Javítás

**A Deployment után:**

1. Menj: **Settings → Environment Variables**
2. Szerkeszd a `NEXTAUTH_URL`-t:
   ```
   NEXTAUTH_URL = https://rezervapp-xyz.vercel.app
   ```
   (használd a tényleges URL-t amit kaptál!)

3. Kattints: **Deployments → ... (három pont) → Redeploy**

---

## ✅ Kész!

Nyisd meg az app-ot:
- **Admin:** https://your-app.vercel.app/login
- **Public Booking:** https://your-app.vercel.app/book/pizzeria-romana

**Demo login:**
- Email: `admin@pizzeriaromana.hu`
- Password: `password123`

---

## 🔄 Frissítés

**Amikor pusholsz GitHubra → Automatikus redeploy!**

Nincs több tennivaló! ✅

---

## 🎨 Custom Domain (opcionális)

1. Vercel Dashboard → **Settings → Domains**
2. Add Domain: `rezervapp.com`
3. Állítsd be a DNS-t (Vercel megmutatja hogyan)

---

## 🗄️ Adatbázis Upgrade (Production)

**SQLite helyett PostgreSQL:**

### Vercel Postgres

1. Vercel Dashboard → **Storage → Create Database**
2. Válaszd: **Postgres**
3. Kattints: **Create**
4. Automatikusan hozzáadja a `DATABASE_URL`-t! ✅

5. **Redeploy** és kész!

---

## 📊 Alternatíva: Railway (Web UI)

Ha Vercel nem működik:

1. 👉 https://railway.app/
2. Kattints: **"Start a New Project"**
3. Válaszd: **"Deploy from GitHub repo"**
4. Keress: `RezervApp`
5. **Settings:**
   - Root Directory: `rezervapp`
   - Start Command: (automatikus)

6. **Variables:**
   ```
   DATABASE_URL=file:/app/data/dev.db
   NEXTAUTH_SECRET=(generate)
   ```

7. Kattints: **Deploy** 🚀

---

## 📱 Teljesen Telefonról (Step-by-Step)

### **1. GitHub App telepítése**
- Telepítsd: **GitHub** app (iOS/Android)
- Jelentkezz be

### **2. Vercel**
- Nyisd meg böngészőben: https://vercel.com
- Sign up with GitHub
- Follow steps fent ☝️

### **3. Minden kattintással működik!**
- Nincs command line
- Nincs terminal
- Csak browser 📱

---

## ⚠️ Troubleshooting

### Build Error: "Cannot find module"
→ Root Directory nem jó!
- Menj: Settings → General
- Root Directory: `rezervapp`
- Redeploy

### Database Error
→ DATABASE_URL rossz
- Vercel SQLite-ot nem támogat production-ben
- Használj Vercel Postgres-t (fent van leírva)

### Auth Error
→ NEXTAUTH_URL nem egyezik
- Settings → Environment Variables
- NEXTAUTH_URL = (pontos Vercel URL)
- Redeploy

---

## 🎉 Success!

**URL-ek mentése:**
- Admin: `https://your-app.vercel.app/login`
- Public: `https://your-app.vercel.app/book/pizzeria-romana`

**Auto-deploy:** Minden git push után automatikus!

**Ingyen:** Vercel Hobby plan teljesen ingyenes!

---

**100% telefonbarát!** Nincs szükség terminálra! 📱✨
