# Deployment Guide - RezervApp on Vercel

This guide walks you through deploying RezervApp to Vercel for testing and production use.

## Prerequisites

- GitHub repository with your RezervApp code
- Vercel account (free tier works fine)

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository (Thsandorh/Hexaflow or RezervApp)
4. Select the `rezervapp` folder as the root directory

### Step 2: Configure Project

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `rezervapp`

**Build Command:**
```bash
npx prisma generate && npm run build
```

**Install Command:** `npm install` (default)

**Output Directory:** `.next` (default)

### Step 3: Environment Variables

Add these environment variables in Vercel dashboard:

**Required:**
```env
# Database (use Vercel Postgres for production)
DATABASE_URL=${POSTGRES_PRISMA_URL}

# Authentication
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-app.vercel.app
AUTH_TRUST_HOST=true

# Encryption for payment credentials
ENCRYPTION_KEY=<generate-with-openssl-rand-hex-32>
```

**Optional - Email Notifications:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

**Optional - Payment Providers:**
```env
# Stripe (Card + Google Pay)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# SimplePay (Hungarian OTP)
SIMPLEPAY_MERCHANT_ID=MERCHANT-12345678
SIMPLEPAY_SECRET_KEY=your-secret-key
SIMPLEPAY_SANDBOX=false
```

**Generate secrets:**
```bash
# NextAuth secret
openssl rand -base64 32

# Encryption key
openssl rand -hex 32
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://your-app-name.vercel.app`

### Step 5: Initialize Database

After first deployment:

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on the latest deployment
3. Go to **Functions** tab
4. Find and run these commands via Vercel CLI or locally:

```bash
# Connect to your deployed instance
vercel env pull .env.local

# Initialize database
npx prisma db push
npx prisma db seed
```

## Option 2: Deploy via Vercel CLI

### Install Vercel CLI

```bash
npm i -g vercel
```

### Login to Vercel

```bash
vercel login
```

### Deploy from rezervapp directory

```bash
cd rezervapp
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **rezervapp**
- Directory? `./` (current directory)

### Set Environment Variables

```bash
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add DATABASE_URL production
vercel env add AUTH_TRUST_HOST production
```

### Deploy again

```bash
vercel --prod
```

## Post-Deployment Steps

### 1. Test the Login

Visit: `https://your-app.vercel.app/login`

Demo credentials (after seed):
- Email: `admin@pizzeriaromana.hu`
- Password: `admin123`

### 2. Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Project Settings → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable to your custom domain

### 3. Enable Email Notifications

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add `RESEND_API_KEY` environment variable in Vercel
4. Redeploy the project

### 4. Configure Payment Providers (Optional)

#### Stripe (International Cards + Google Pay)

1. **Create Stripe Account:**
   - Sign up at [stripe.com](https://stripe.com)
   - Complete business verification

2. **Get API Keys:**
   - Dashboard → Developers → API keys
   - Copy Secret key (sk_live_xxx)

3. **Setup Webhook:**
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/payments/webhook`
   - Select event: `checkout.session.completed`
   - Copy webhook secret (whsec_xxx)

4. **Enable Google Pay:**
   - Dashboard → Settings → Payment methods
   - Wallets section → Enable Google Pay
   - No code changes needed!

5. **Add to Vercel:**
   ```env
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
   ```
   OR configure via Admin UI after deployment

#### SimplePay (Hungarian OTP Gateway)

1. **Get SimplePay Account:**
   - Contact OTP SimplePay for merchant account
   - Receive Merchant ID and Secret Key

2. **Configure IPN:**
   - SimplePay Admin → Settings → IPN
   - Add URL: `https://your-app.vercel.app/api/payments/simplepay-ipn`

3. **Add to Vercel:**
   ```env
   SIMPLEPAY_MERCHANT_ID=MERCHANT-12345678
   SIMPLEPAY_SECRET_KEY=your-secret-key
   SIMPLEPAY_SANDBOX=false
   ```
   OR configure via Admin UI after deployment

4. **Test in Sandbox First:**
   - Use sandbox credentials for testing
   - Set `SIMPLEPAY_SANDBOX=true`
   - Switch to production when ready

## Database Notes

**Important:** SQLite (`file:./dev.db`) works on Vercel but has limitations:

- ⚠️ Database resets on each deployment
- ⚠️ Not suitable for production with real data
- ✅ Perfect for testing and demos

### For Production

Consider upgrading to a hosted database:

**Option A: Vercel Postgres**
```bash
vercel postgres create
```

**Option B: PlanetScale (MySQL)**
1. Create free database at [planetscale.com](https://planetscale.com)
2. Update `DATABASE_URL` to connection string
3. Update `prisma/schema.prisma` provider to `mysql`

**Option C: Supabase (PostgreSQL)**
1. Create project at [supabase.com](https://supabase.com)
2. Copy connection string
3. Update `DATABASE_URL` and provider

## Troubleshooting

### Build Fails

**Error:** `Prisma Client not generated`

**Solution:** Ensure build command includes:
```bash
npx prisma generate && npm run build
```

### Authentication Not Working

**Error:** `[auth][error] UntrustedHost`

**Solution:** Set environment variables:
```env
NEXTAUTH_URL=https://your-actual-domain.vercel.app
AUTH_TRUST_HOST=true
```

### Database Not Found

**Error:** `Can't reach database server`

**Solution:** Run after deployment:
```bash
npx prisma db push
npx prisma db seed
```

## Monitoring and Logs

View real-time logs in Vercel Dashboard:
- **Deployments** → Select deployment → **Logs**
- **Analytics** → View traffic and performance
- **Speed Insights** → Monitor Core Web Vitals

## Auto-Deploy on Git Push

Vercel automatically deploys:
- **Production:** Push to `main` branch
- **Preview:** Push to any other branch (e.g., `claude/...`)

Disable in Project Settings → **Git** if needed.

## Cost Estimate

**Free Tier Includes:**
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Preview deployments

Perfect for testing RezervApp! 🎉

---

**Need help?** Check [Vercel Docs](https://vercel.com/docs) or open an issue.
