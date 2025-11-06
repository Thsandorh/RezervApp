# 🍽️ RezervApp - Restaurant Reservation System

> **Status: ✅ MVP Phase 2 Complete - Public Booking System Ready!**

Modern, full-stack SaaS application for restaurant reservation management, built for Hungarian restaurants.

## ☁️ Deploy (Choose Your Way!)

### 📱 From Phone (Zero Config!)

👉 **[Vercel Deploy Guide - Phone-Friendly!](./DEPLOY_PHONE.md)**

1. Open: https://vercel.com/signup (GitHub login)
2. Import GitHub repo: `RezervApp`
3. Root Directory: `rezervapp`
4. Deploy! ✅

**100% web-based, no terminal!** Auto-deploys on GitHub push!

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

## ✅ What's Complete (Phase 1)

### Admin Dashboard & Management
- ✅ **Authentication** - NextAuth.js with email/password
- ✅ **Dashboard** - Today's bookings overview with statistics
- ✅ **Booking Management** - List and calendar views (FullCalendar)
- ✅ **Table Management** - Full CRUD operations with location grouping
- ✅ **Guest Tracking** - Automatic profile creation, VIP status, no-show tracking
- ✅ **Email Notifications** - Resend API integration with Hungarian templates
- ✅ **Public Cancellation** - Token-based secure cancellation page
- ✅ **Deployment Ready** - Vercel configuration included

### Technical Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** SQLite (dev), PostgreSQL ready (production)
- **Auth:** NextAuth.js v5
- **Email:** Resend + React Email
- **Calendar:** FullCalendar with Hungarian localization

---

## ✅ Phase 2: Public Booking System (COMPLETE!)

- [x] **Public booking form** - Guest-facing booking page with restaurant info
- [x] **Date & time picker** - Dynamic time slots with real-time availability
- [x] **Table availability validation** - Smart table assignment based on capacity
- [x] **Booking conflict prevention** - Duration-aware overlap detection
- [x] **Operating hours management** - Validates bookings against restaurant hours
- [x] **Advanced booking limits** - Min/max advance booking time validation

## 🚧 What's NOT Complete Yet

### Phase 3: Extended Features
- [ ] SMS notifications (Twilio)
- [ ] Advanced analytics & reporting
- [ ] Waitlist functionality
- [ ] Multi-tenant support
- [ ] Manual booking creation (admin)
- [ ] Payment integration (Stripe)

**Full roadmap:** See `rezervapp/README.md`

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
│   │   └── tables/          # ✅ Table management
│   ├── api/                 # ✅ API endpoints (COMPLETE)
│   │   ├── bookings/        # ✅ Booking CRUD
│   │   └── tables/          # ✅ Table CRUD
│   ├── booking/
│   │   └── cancel/[token]   # ✅ Public cancellation (COMPLETE)
│   └── login/               # ✅ Login page (COMPLETE)
├── components/
│   ├── admin/               # ✅ Admin components
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
3. Add environment variables (see `.env.example`)
4. Deploy!

**Full deployment guide:** `rezervapp/DEPLOYMENT.md`

### Environment Variables Required
```env
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
AUTH_TRUST_HOST=true
RESEND_API_KEY=your-resend-key (optional)
```

---

## 📚 Documentation

- **[Main README](./rezervapp/README.md)** - Complete features & tech stack
- **[Deployment Guide](./rezervapp/DEPLOYMENT.md)** - Vercel deployment steps
- **[Project Plan](./REZERVAPP_PLAN.md)** - Detailed MVP phases & roadmap
- **[Database Schema](./rezervapp/prisma/schema.prisma)** - Full Prisma schema

---

## 🎯 Current Status Summary

| Feature | Status |
|---------|--------|
| Admin Authentication | ✅ Complete |
| Booking Management (Admin) | ✅ Complete |
| Calendar View | ✅ Complete |
| Table Management | ✅ Complete |
| Guest Tracking | ✅ Complete |
| Email Notifications | ✅ Complete |
| Public Cancellation | ✅ Complete |
| Deployment Config | ✅ Complete |
| **Public Booking Form** | ✅ Complete |
| Real-time Availability | ✅ Complete |
| Operating Hours Validation | ✅ Complete |
| SMS Notifications | ❌ Not Started |
| Advanced Analytics | ❌ Not Started |
| Waitlist UI | ❌ Not Started |
| Multi-tenant | ❌ Not Started |

**✅ Phase 1 (Admin Core):** COMPLETE - Ready for internal restaurant use
**✅ Phase 2 (Public Booking):** COMPLETE - Guests can now self-book online!
**🚧 Phase 3 (Extended Features):** Next - SMS, Analytics, Waitlist

---

## 🛠️ Tech Stack Summary

**Frontend:** Next.js 14 • TypeScript • Tailwind CSS • shadcn/ui • FullCalendar
**Backend:** Prisma ORM • NextAuth.js • Resend Email • React Email
**Database:** SQLite (dev) • PostgreSQL ready (prod)
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

**🎉 Phase 2 Complete!** The system is now fully functional with both admin management AND public-facing booking! Guests can self-book online with real-time availability checking.

**Questions?** Open an issue on GitHub or check the documentation in `/rezervapp/README.md`
