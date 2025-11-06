# 🚀 Vercel Deployment Guide - Complete Setup

## ⚠️ Important: PostgreSQL Required

**SQLite does NOT work on Vercel** because the file system is read-only in serverless environments.

You **must** use PostgreSQL for Vercel deployment.

---

## Step-by-Step Deployment

### 1️⃣ Create Vercel Account

1. Go to: https://vercel.com/signup
2. Sign in with GitHub
3. Authorize Vercel

### 2️⃣ Create Vercel Postgres Database

**Before deploying the app:**

1. Go to Vercel Dashboard
2. Click **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Database name: `rezervapp-db`
6. Region: Choose closest to your users
7. Click **Create**

✅ Vercel automatically creates these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` ← **We need this one!**
- `POSTGRES_URL_NON_POOLING`

### 3️⃣ Update Prisma Schema for PostgreSQL

**In `rezervapp/prisma/schema.prisma`**, change:

```prisma
datasource db {
  provider = "sqlite"           // ❌ Remove this
  url      = env("DATABASE_URL")
}
```

To:

```prisma
datasource db {
  provider = "postgresql"       // ✅ Use this
  url      = env("DATABASE_URL")
}
```

**Commit and push this change:**
```bash
git add prisma/schema.prisma
git commit -m "Switch to PostgreSQL for production"
git push
```

### 4️⃣ Import GitHub Repository

1. Vercel Dashboard → **Add New...** → **Project**
2. Search for: `RezervApp`
3. Click **Import**

### 5️⃣ Configure Project Settings

**Root Directory:**
```
rezervapp
```

**Build Command:** (leave default)
```
npm run build
```

### 6️⃣ Set Environment Variables

Click **Environment Variables** and add:

| Name | Value | Notes |
|------|-------|-------|
| `DATABASE_URL` | `${POSTGRES_PRISMA_URL}` | References the Postgres DB |
| `NEXTAUTH_SECRET` | (click Generate) | Random secure string |
| `NEXTAUTH_URL` | (leave empty) | Vercel auto-detects |
| `AUTH_TRUST_HOST` | `true` | Required for NextAuth |
| `RESEND_API_KEY` | (optional) | Only if you want emails |

**Important:** Use `${POSTGRES_PRISMA_URL}` to reference the database you created in Step 2.

### 7️⃣ Deploy!

Click **Deploy** 🚀

**Wait 2-3 minutes** for build to complete.

---

## 📊 Initialize Database with Data

After first deployment, you need to:

### Option A: Run Migrations via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migration
vercel env pull .env.production
cd rezervapp
npx prisma migrate deploy
npx prisma db seed
```

### Option B: Manually via Prisma Studio

1. Install dependencies locally:
   ```bash
   cd rezervapp
   npm install
   ```

2. Connect to Vercel Postgres:
   ```bash
   # Get DATABASE_URL from Vercel Dashboard → Settings → Environment Variables
   export DATABASE_URL="postgresql://..."
   ```

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Seed database:
   ```bash
   npm run db:seed
   ```

### Option C: Create Restaurant Manually

1. Go to: `https://your-app.vercel.app/login`
2. Create staff account (you'll need to do this via database)
3. Add restaurant and tables via admin panel

---

## ✅ Verify Deployment

Test these URLs:

- **Admin Login:** `https://your-app.vercel.app/login`
- **Public Booking:** `https://your-app.vercel.app/book/pizzeria-romana`

**Demo Credentials** (after seeding):
- Email: `admin@pizzeriaromana.hu`
- Password: `password123`

---

## 🔄 Auto-Deploy on Push

Every time you push to GitHub:
1. Vercel automatically detects the push
2. Rebuilds the application
3. Deploys the new version

**Zero manual work needed!** ✨

---

## 🐛 Troubleshooting

### "500 Internal Server Error"

**Cause:** Database not initialized or wrong DATABASE_URL

**Fix:**
1. Check Environment Variables in Vercel Dashboard
2. Verify `DATABASE_URL` = `${POSTGRES_PRISMA_URL}`
3. Run migrations (see Step 7 above)

### "Restaurant not found"

**Cause:** No data in database

**Fix:** Run the seed script (see Step 7, Option A or B)

### "Cannot find module @prisma/client"

**Cause:** Prisma client not generated

**Fix:** Redeploy (the `postinstall` script should handle this)

### Build fails with "provider mismatch"

**Cause:** Schema still set to `sqlite` instead of `postgresql`

**Fix:** Update `prisma/schema.prisma` provider to `postgresql` (Step 3)

---

## 📈 Performance Tips

### Enable Prisma Accelerate (Optional)

1. Go to: https://console.prisma.io/
2. Enable Accelerate for your project
3. Add `PRISMA_ACCELERATE_URL` to Vercel env vars

### Connection Pooling

Vercel Postgres automatically provides connection pooling via `POSTGRES_PRISMA_URL`.

**No additional configuration needed!** ✅

---

## 💰 Costs

- **Vercel Hobby Plan:** Free (includes 100GB bandwidth)
- **Vercel Postgres:**
  - Hobby: $0 (256MB, 60 hours compute)
  - Pro: $20/month (10GB)

**For small restaurants:** Free tier is enough! 🎉

---

## 🎯 Quick Reference

**Environment Variables for Vercel:**

```env
DATABASE_URL=${POSTGRES_PRISMA_URL}
NEXTAUTH_SECRET=<generate-random-32-chars>
NEXTAUTH_URL=<leave-empty>
AUTH_TRUST_HOST=true
RESEND_API_KEY=<optional-for-emails>
```

**Commands for Database Setup:**

```bash
vercel env pull .env.production
cd rezervapp
npx prisma migrate deploy
npx prisma db seed
```

---

## 🎉 Done!

Your RezervApp is now live on Vercel with PostgreSQL! 🚀

**Next Steps:**
- Add your custom domain
- Set up email notifications (Resend API)
- Customize restaurant settings via admin panel

---

## 📞 Need Help?

- Check logs: Vercel Dashboard → Deployment → Runtime Logs
- GitHub Issues: https://github.com/Thsandorh/RezervApp/issues
- Vercel Docs: https://vercel.com/docs
