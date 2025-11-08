# 🍽️ RezervApp - Restaurant Reservation System

> **Status: ✅ v2.1.0 - Production Ready with Staff Management & Enhanced Security!**

Modern, full-stack SaaS application for restaurant reservation management with integrated payment processing, comprehensive staff management, and advanced security features - built for Hungarian restaurants.

## ☁️ Deploy (Choose Your Way!)

### 📱 From Phone (No Terminal!)

👉 **[Vercel Deploy Guide - Phone-Friendly!](./DEPLOY_PHONE.md)**

1. Open: https://vercel.com/signup (GitHub login)
2. Import GitHub repo: `RezervApp`
3. Root Directory: `rezervapp`
4. Add environment variables (see deployment guide)
5. Deploy! ✅

**100% web-based, no terminal needed!** Auto-deploys on GitHub push!

---

### 💻 From Computer (Command Line)

```bash
fly auth login
cd rezervapp && fly launch --now
```

👉 **[CLI Deployment Guide](./DEPLOY.md)** - Fly.io, Railway, Render

---

### 🐳 Local Docker

```bash
cd rezervapp && ./start.sh
```

Open: http://localhost:3000

---

## 📍 Project Location

**Main Application:** `/rezervapp/` directory

All source code, documentation, and deployment configuration is located in the `rezervapp` subfolder.

👉 **[View Full Documentation](./rezervapp/README.md)**

---

## ✅ All Core Features Complete! (v2.1.0)

### 1. 🔐 Authentication & Authorization
- ✅ NextAuth.js v5 with email/password
- ✅ Protected admin routes with middleware
- ✅ Secure session management
- ✅ **Google reCAPTCHA v3** - Bot protection on login
- ✅ **Account lockout** - 5 failed attempts = 30 min lock
- ✅ **IP-based rate limiting** - Login attempt tracking

### 2. 📊 Admin Dashboard
- ✅ Real-time statistics (today's bookings, revenue, guests)
- ✅ Quick overview of pending/confirmed bookings
- ✅ **Collapsible sidebar** - Icon-only & expanded modes
- ✅ **Mobile-friendly** - Overlay sidebar, no content blocking
- ✅ **Interactive table cards** - Click for detailed booking info
- ✅ **Table info modal** - Current & next bookings, guest details
- ✅ **Mobile touch support** - Optimized for touch devices

### 3. 👥 Staff Management (NEW in v2.1.0)
- ✅ **Complete staff CRUD** - Add, edit, delete staff members
- ✅ **Role-based access control** - OWNER, MANAGER, STAFF
- ✅ **Staff list page** - All members with status and roles
- ✅ **Active/inactive toggle** - Manage staff account status
- ✅ **Last login tracking** - Security and activity monitoring
- ✅ **Email uniqueness** - Prevent duplicate accounts
- ✅ **Self-deletion prevention** - Safety check
- ✅ **OWNER-only access** - Secure staff management

### 4. 📅 Booking Management
- ✅ List view with filtering (status, date)
- ✅ Calendar view (FullCalendar with Hungarian locale)
- ✅ Full booking details modal with status updates
- ✅ Internal notes for staff

### 5. 🍴 Table Management
- ✅ Full CRUD operations
- ✅ Location/area grouping (Terasz, Belső terem, etc.)
- ✅ Capacity management (2-12 guests)
- ✅ Visual table arrangement

### 6. 👤 Guest Management
- ✅ Automatic guest profile creation
- ✅ VIP status tracking
- ✅ No-show tracking
- ✅ Booking history per guest

### 7. 🌐 Public Booking System
- ✅ Guest-facing booking form
- ✅ Real-time availability checking
- ✅ Smart table assignment by party size
- ✅ Operating hours validation
- ✅ Min/max advance booking limits
- ✅ Success page with booking details

### 8. ✉️ Email Notifications
- ✅ Resend API integration
- ✅ Beautiful React Email templates
- ✅ Booking confirmation emails
- ✅ Cancellation emails
- ✅ Hungarian localization

### 9. 📱 SMS Notifications (Twilio)
- ✅ SMS confirmation messages
- ✅ SMS reminders
- ✅ Hungarian language support
- ✅ Configurable via admin settings

### 10. 📈 Analytics & Reports
- ✅ Revenue tracking
- ✅ Booking trends (daily, weekly)
- ✅ Popular time slots analysis
- ✅ Table utilization metrics
- ✅ No-show statistics

### 11. ⚙️ Admin Tools & Settings (OWNER-only)
- ✅ **Payment configuration** - Stripe & SimplePay setup
- ✅ **reCAPTCHA configuration** - Bot protection settings
- ✅ **Encrypted credential storage** - Secure API key storage
- ✅ **Dangerous operations** - Delete all bookings/tables
- ✅ **Double confirmation dialogs** - Prevent accidental data loss
- ✅ **Restaurant settings API** - Centralized configuration

### 💳 NEW in v2.0.0: Payment Integration
- ✅ **Stripe Checkout** - International card payments
- ✅ **Google Pay** - One-click mobile payments
- ✅ **SimplePay** - Hungarian OTP bank gateway
- ✅ Multi-provider support (choose Stripe or SimplePay)
- ✅ Secure credential encryption (AES-256)
- ✅ Webhook/IPN payment verification
- ✅ Admin configuration UI for payment providers
- ✅ PCI-DSS compliant (hosted payment pages)

### 🎁 BONUS: Waitlist System
- ✅ Waitlist management UI
- ✅ Notify guests when tables available
- ✅ Seat from waitlist
- ✅ Cancel waitlist entries

### 🎨 UI/UX Improvements
- ✅ **Responsive sidebar** - Collapsible with icon-only mode
- ✅ **Mobile optimization** - Full touch support, no content overlap
- ✅ **Dark theme sidebar** - Modern gray/blue design
- ✅ **Smooth animations** - Transitions for all interactive elements

### Technical Stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (production), SQLite (dev)
- **Auth:** NextAuth.js v5, bcryptjs password hashing
- **Security:** Google reCAPTCHA v3, AES-256 encryption, HMAC-SHA384 signatures, rate limiting
- **Payments:** Stripe (Cards + Google Pay), SimplePay (Hungarian OTP)
- **Email:** Resend + React Email
- **SMS:** Twilio
- **Calendar:** FullCalendar with Hungarian localization

---

## 🎯 Production Ready! (v2.1.0)

All core features including payment integration, staff management, and enhanced security are complete and tested. The system is ready for deployment to production environments.

**Included in v2.1.0:**
- ✅ Complete reservation management system
- ✅ **Staff management with role-based access control**
- ✅ **Google reCAPTCHA v3 bot protection**
- ✅ **Enhanced security features** (account lockout, rate limiting)
- ✅ Payment processing (Stripe, Google Pay, SimplePay)
- ✅ Email & SMS notifications
- ✅ Analytics & reporting
- ✅ Responsive mobile design with interactive table cards
- ✅ PCI-DSS compliant payment handling
- ✅ OWNER-only admin tools and dangerous operations

**Future enhancements:**
- [ ] Multi-tenant SaaS support (subdomain-based)
- [ ] Advanced AI-powered table optimization
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced reporting & exports

**Full roadmap & changelog:** See `rezervapp/README.md`

---

## 🚀 Quick Start

### 🐳 Option 1: Docker (Easiest!)

```bash
cd rezervapp
./start.sh
```

**Done!** 🎉 → http://localhost:3000

👉 **[Docker Deployment Guide](./DOCKER.md)**

---

### 💻 Option 2: Local Development

#### 1. Navigate to App Directory
```bash
cd rezervapp
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Setup Environment
```bash
cp .env.example .env
# Edit .env with your values
```

#### 4. Initialize Database
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

#### 5. Start Development Server
```bash
npm run dev
```

Application available at: **http://localhost:3000**

---

## 🔐 Demo Credentials

After running the seed script:

- **Admin Login:** `admin@pizzeriaromana.hu` / `password123`
- **Admin Dashboard:** http://localhost:3000/admin
- **Public Cancellation:** Any booking will have a cancellation link in email

**Test Restaurant:** Pizzeria Romana (demo data included)

---

## 📂 Project Structure

```
rezervapp/                    # Main application folder
├── app/
│   ├── admin/               # ✅ Admin dashboard (COMPLETE)
│   │   ├── page.tsx         # ✅ Dashboard homepage
│   │   ├── bookings/        # ✅ List + calendar views
│   │   ├── tables/          # ✅ Table management
│   │   ├── staff/           # ✅ Staff management (OWNER-only)
│   │   ├── settings/        # ✅ Settings (OWNER-only)
│   │   └── analytics/       # ✅ Analytics & reports
│   ├── api/                 # ✅ API endpoints (COMPLETE)
│   │   ├── bookings/        # ✅ Booking CRUD
│   │   ├── tables/          # ✅ Table CRUD
│   │   ├── admin/           # ✅ Admin-only endpoints
│   │   │   ├── staff/       # ✅ Staff CRUD
│   │   │   ├── restaurant/  # ✅ Restaurant settings
│   │   │   └── delete-all-* # ✅ Dangerous operations
│   │   └── recaptcha-config/# ✅ Public reCAPTCHA config
│   ├── booking/
│   │   └── cancel/[token]   # ✅ Public cancellation (COMPLETE)
│   └── login/               # ✅ Login page (COMPLETE)
├── components/
│   ├── admin/               # ✅ Admin components
│   │   ├── staff-form.tsx   # ✅ Add/edit staff
│   │   ├── staff-list.tsx   # ✅ Staff list page
│   │   ├── recaptcha-settings.tsx # ✅ reCAPTCHA config
│   │   ├── dangerous-actions.tsx  # ✅ Bulk delete
│   │   └── table-info-modal.tsx   # ✅ Table details
│   ├── modals/              # ✅ Booking/Table modals
│   └── ui/                  # ✅ shadcn/ui components
├── emails/                   # ✅ Email templates
├── lib/                      # ✅ Utilities (auth, email, prisma)
├── prisma/                   # ✅ Database schema + seed
├── .env.example              # ✅ Environment template
├── vercel.json               # ✅ Deployment config
├── DEPLOYMENT.md             # ✅ Deployment guide
└── README.md                 # ✅ Full documentation
```

---

## 🗄️ Database Schema

```
Restaurant (Restaurant info)
├── Tables (capacity, location)
├── Bookings (date, status, party size)
├── Guests (VIP status, no-show tracking)
├── Staff (admin users, roles)
└── Waitlist (schema ready, UI not implemented)
```

**6 Prisma models** fully implemented. See `rezervapp/prisma/schema.prisma`

---

## 📊 Demo Data

### Restaurant: Pizzeria Romana
- **Location:** Budapest, Hungary
- **Tables:** 8 tables (2-8 capacity)
- **Guests:** 4 sample guests with booking history
- **Bookings:** 4 sample bookings with various statuses

All data created by seed script. Safe to reset anytime.

---

## 🚢 Deployment

### Vercel (Recommended)

**Quick Deploy:**
```bash
cd rezervapp
vercel --prod
```

**Or via GitHub:**
1. Connect repository to Vercel
2. Set root directory to `rezervapp`
3. Add environment variables (see below)
4. Deploy!

**Full deployment guides:**
- 📱 **[Phone Deployment (Zero Terminal!)](./DEPLOY_PHONE.md)** - Web UI only
- 💻 **[CLI Deployment](./DEPLOY.md)** - Fly.io, Railway, Render

### Environment Variables Required

Add these in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `${POSTGRES_PRISMA_URL}` | Use Vercel Postgres for production |
| `NEXTAUTH_SECRET` | (random string) | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | (leave empty) | Vercel auto-detects this |
| `AUTH_TRUST_HOST` | `true` | Required for NextAuth |
| `ENCRYPTION_KEY` | (random string) | Generate with: `openssl rand -hex 32` |
| `RESEND_API_KEY` | (optional) | For email notifications |
| `STRIPE_SECRET_KEY` | (optional) | For Stripe + Google Pay |
| `STRIPE_WEBHOOK_SECRET` | (optional) | From Stripe webhook setup |
| `SIMPLEPAY_MERCHANT_ID` | (optional) | For SimplePay (Hungarian) |
| `SIMPLEPAY_SECRET_KEY` | (optional) | From SimplePay account |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | (optional) | Google reCAPTCHA site key |
| `RECAPTCHA_SECRET_KEY` | (optional) | Google reCAPTCHA secret key |

**Payment providers and reCAPTCHA can also be configured via Admin UI after deployment (OWNER-only access).**

**After adding variables:** Click "Redeploy" for changes to take effect.

---

## 📚 Documentation

- **[Main README](./rezervapp/README.md)** - Complete features & tech stack
- **[Phone Deployment Guide](./DEPLOY_PHONE.md)** - Zero terminal deployment
- **[CLI Deployment Guide](./DEPLOY.md)** - Fly.io, Railway, Render
- **[Docker Guide](./DOCKER.md)** - Local Docker deployment
- **[Project Plan](./REZERVAPP_PLAN.md)** - Detailed MVP phases & roadmap
- **[Database Schema](./rezervapp/prisma/schema.prisma)** - Full Prisma schema

---

## 🎯 Current Status Summary

| Feature | Status |
|---------|--------|
| Admin Authentication | ✅ Complete |
| **Google reCAPTCHA v3** | ✅ Complete (v2.1.0) |
| **Account Lockout Protection** | ✅ Complete (v2.1.0) |
| Collapsible Sidebar (Mobile) | ✅ Complete |
| **Staff Management (CRUD)** | ✅ Complete (v2.1.0) |
| **Role-based Access Control** | ✅ Complete (v2.1.0) |
| Booking Management (Admin) | ✅ Complete |
| Calendar View | ✅ Complete |
| Table Management | ✅ Complete |
| **Interactive Table Cards** | ✅ Complete (v2.1.0) |
| **Table Info Modal** | ✅ Complete (v2.1.0) |
| Guest Tracking | ✅ Complete |
| Email Notifications | ✅ Complete |
| **SMS Notifications (Twilio)** | ✅ Complete |
| Public Booking Form | ✅ Complete |
| Public Booking Edit | ✅ Complete |
| Real-time Availability | ✅ Complete |
| Operating Hours Validation | ✅ Complete |
| **Analytics Dashboard** | ✅ Complete |
| **Waitlist Management** | ✅ Complete |
| **Payment Integration (Stripe, Google Pay, SimplePay)** | ✅ Complete (v2.0.0) |
| **Admin Tools & Dangerous Operations** | ✅ Complete (v2.1.0) |
| Deployment Config | ✅ Complete |
| Multi-tenant SaaS | ⏳ Future Enhancement |

**✅ v2.1.0 - Staff Management & Enhanced Security:** COMPLETE - Production Ready!
**✅ v2.0.0 - Payment Integration:** COMPLETE - Production Ready!
**✅ Responsive Design:** Desktop + Mobile optimized with collapsible sidebar & touch support
**✅ Full Hungarian Localization:** Email templates, SMS, UI text
**✅ Payment Processing:** Stripe (Cards + Google Pay) & SimplePay (Hungarian OTP)
**✅ Security Features:** reCAPTCHA v3, Account Lockout, Rate Limiting, AES-256 Encryption

---

## 🛠️ Tech Stack Summary

**Frontend:** Next.js 16 • React 19 • TypeScript • Tailwind CSS v4 • shadcn/ui • FullCalendar
**Backend:** Prisma ORM • NextAuth.js v5 • Resend Email • React Email
**Payments:** Stripe (Cards + Google Pay) • SimplePay (Hungarian OTP)
**Database:** PostgreSQL (production) • SQLite (dev)
**Deployment:** Vercel • Auto-deploy on push

---

## 📝 License

MIT License - Free to use in your own projects.

---

## 👨‍💻 Developer

**Thsandorh** - [GitHub Profile](https://github.com/Thsandorh)

Built with ❤️ for Hungarian restaurants.

---

## ⭐ Support This Project

If you find this project useful, please consider:
- Giving it a **star** on GitHub
- Sharing it with other restaurant owners
- Contributing to the codebase
- Reporting bugs and suggesting features

---

**🎉 v2.1.0 - All Features Complete!** The system is fully production-ready with:
- ✅ **Staff management** with role-based access control (OWNER/MANAGER/STAFF)
- ✅ **Google reCAPTCHA v3** bot protection on login
- ✅ **Enhanced security** (account lockout, rate limiting, encrypted storage)
- ✅ Admin management (collapsible sidebar, mobile-friendly)
- ✅ **Interactive dashboard** with clickable table cards
- ✅ Public booking system with real-time availability
- ✅ **Payment processing** (Stripe, Google Pay, SimplePay)
- ✅ Email & SMS notifications
- ✅ Analytics & reporting dashboard
- ✅ Waitlist management
- ✅ Responsive design for all devices with mobile touch support
- ✅ PCI-DSS compliant payment handling
- ✅ **OWNER-only admin tools** and dangerous operations

**Ready to deploy to Vercel!** Follow the deployment guide above.

**Questions?** Open an issue on GitHub or check `/rezervapp/README.md` for detailed documentation.

**See full changelog and detailed setup guides:** `/rezervapp/README.md`

