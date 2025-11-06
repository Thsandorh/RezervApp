# 📱 RezervApp - Deploy from Phone (Zero Config!)

## 🎯 Vercel - Easiest (100% Web-Based!)

### 1️⃣ GitHub Account

If you don't have one:
👉 https://github.com/signup

### 2️⃣ Vercel Sign Up

👉 https://vercel.com/signup

**Click:** "Continue with GitHub"

✅ Authorize access

### 3️⃣ Deploy (3 Clicks!)

**A.) On Vercel Dashboard:**

1. Click: **"Add New..." → "Project"**
2. Search: `RezervApp`
3. Click: **"Import"**

**B.) Settings:**

```
Root Directory: rezervapp
```
☝️ **Type this:** `rezervapp` (very important!)

**C.) Environment Variables:**

Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `file:./dev.db` |
| `NEXTAUTH_SECRET` | (click "Generate" or use any random string) |
| `NEXTAUTH_URL` | (leave empty - Vercel auto-detects) |
| `AUTH_TRUST_HOST` | `true` |

**D.) Deploy!**

Click: **"Deploy"** 🚀

---

## ⏱️ Wait 2-3 minutes...

Vercel automatically:
- ✅ Builds the app
- ✅ Deploys it
- ✅ Gives you a URL (e.g., rezervapp.vercel.app)
- ✅ Sets up the database on first run

---

## ✅ Done!

Open your app:
- **Admin:** https://your-app.vercel.app/login
- **Public Booking:** https://your-app.vercel.app/book/pizzeria-romana

**Demo login:**
- Email: `admin@pizzeriaromana.hu`
- Password: `password123`

---

## 🔄 Updates

**When you push to GitHub → Automatic redeploy!**

Nothing else to do! ✅

---

## 🎨 Custom Domain (optional)

1. Vercel Dashboard → **Settings → Domains**
2. Add Domain: `rezervapp.com`
3. Follow DNS setup instructions

---

## 🗄️ Database Upgrade (Production)

**SQLite → PostgreSQL:**

### Vercel Postgres

1. Vercel Dashboard → **Storage → Create Database**
2. Select: **Postgres**
3. Click: **Create**
4. It auto-connects! ✅

5. **Redeploy** - done!

---

## 📊 Alternative: Railway (Web UI)

If Vercel doesn't work:

1. 👉 https://railway.app/
2. Click: **"Start a New Project"**
3. Select: **"Deploy from GitHub repo"**
4. Search: `RezervApp`
5. Set the same environment variables as Vercel (step C above)
6. Click: **Deploy** 🚀

---

## 📱 Completely from Phone (Step-by-Step)

### **1. Install GitHub App**
- Install: **GitHub** app (iOS/Android)
- Sign in

### **2. Vercel**
- Open in browser: https://vercel.com
- Sign up with GitHub
- Follow steps above ☝️

### **3. Everything works with clicks!**
- No command line
- No terminal
- Just browser 📱

---

## ⚠️ Troubleshooting

### Build Error: "Cannot find module"
→ Root Directory is wrong!
- Go: Settings → General
- Root Directory: `rezervapp`
- Redeploy

### Database Error (Production)
→ SQLite doesn't work well in production
- Use Vercel Postgres (steps above)
- Or Railway Postgres

### Page loads but looks broken
→ Clear browser cache and reload

---

## 🎉 Success!

**Save your URLs:**
- Admin: `https://your-app.vercel.app/login`
- Public: `https://your-app.vercel.app/book/pizzeria-romana`

**Auto-deploy:** Every git push = automatic deploy!

**Free:** Vercel Hobby plan is completely free!

---

## 🚀 Required Environment Variables

You need to set these in Vercel (see step C above):

✅ **DATABASE_URL** - Start with `file:./dev.db` (SQLite)
✅ **NEXTAUTH_SECRET** - Random string (use Vercel's Generate button)
✅ **NEXTAUTH_URL** - Auto-detected by Vercel (can leave empty)
✅ **AUTH_TRUST_HOST** - Set to `true`

**After first deploy:** Upgrade to Vercel Postgres for production use!

---

**100% phone-friendly!** No terminal required! 📱✨
