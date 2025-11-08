# RezervApp

> **Status: ✅ Production Ready with Payment Integration**

Professional restaurant reservation and management system for Hungarian restaurants with integrated online payment support.

## Overview

RezervApp is a full-stack SaaS application that simplifies restaurant booking management. The system enables online guest reservations, table tracking, payment processing, and provides a comprehensive admin interface for restaurant staff.

## Features

### ✅ User Authentication
- Secure login with NextAuth.js v5
- JWT session management
- Role-based access control (admin/staff/manager)
- Protected admin routes with middleware
- Session security with proper token rotation

### ✅ Booking Management
- **Multiple View Modes:**
  - List view with advanced filtering
  - Calendar view with FullCalendar integration
  - Table map with real-time status
- **Booking Status Management:**
  - PENDING (Awaiting confirmation)
  - CONFIRMED (Confirmed)
  - SEATED (Guest seated)
  - COMPLETED (Completed)
  - CANCELLED (Cancelled)
  - NO_SHOW (No show)
- Detailed booking information modal
- Internal staff notes
- Special guest requests tracking
- Booking creation from admin panel
- Advanced search and filtering
- Date range filtering
- Status-based filtering

### ✅ Payment Integration
- **Multiple Payment Providers:**
  - **Stripe** - International card payments + Google Pay
  - **SimplePay** - Hungarian OTP payment gateway
- **Google Pay Support:**
  - Automatic detection on supported devices
  - One-tap payment experience
  - Seamless Stripe integration
- **SimplePay Features:**
  - Hungarian market optimized
  - HUF, EUR, USD support
  - Secure HMAC-SHA384 signature verification
  - IPN (Instant Payment Notification) webhook
  - Sandbox and production modes
- **Security:**
  - Encrypted credential storage
  - Signature verification for all callbacks
  - PCI-compliant payment flows
  - No sensitive data in client code
- **Admin Configuration:**
  - Easy setup through admin panel
  - Encrypted API key storage
  - Payment method enable/disable

### ✅ Email Notifications
- Automatic booking confirmation emails
- Payment confirmation emails
- Resend API integration
- React Email HTML templates
- Hungarian language content with proper formatting
- Cancellation link generation
- Beautiful responsive email design

### ✅ Public Booking Cancellation
- Token-based secure access
- Two-step confirmation process
- Time-based warnings (< 2 hours)
- Booking status validation
- Guest-friendly interface

### ✅ Table Management
- Create, edit, and delete tables
- Set capacity and location
- Group tables by location (Indoor, Terrace, VIP, etc.)
- Unique name validation per restaurant
- Protection against deletion of tables with active bookings
- Real-time table availability status
- Color-coded status indicators:
  - 🟢 Free
  - 🔴 Occupied
  - 🟡 Soon (within 1 hour)
  - ⚪ Inactive

### ✅ Guest Tracking
- Comprehensive guest profile management
- Complete booking history
- VIP status marking
- No-show counter and statistics
- Total bookings tracking
- Phone number and email management
- Guest notes and preferences
- Allergy and dietary restriction notes

### ✅ Dashboard
- Real-time booking statistics
- Today's bookings overview
- Quick access to main features
- Guest and table summaries
- Upcoming bookings widget
- Payment status overview

## Tech Stack

### Frontend
- **Next.js 16** - App Router and React Server Components
- **React 19** - Latest React features
- **TypeScript 5** - Full type-safe development
- **Tailwind CSS 4** - Modern utility-first styling
- **shadcn/ui** - High-quality reusable UI components
- **Radix UI** - Accessible headless UI primitives
- **FullCalendar 6** - Advanced calendar with Hungarian locale
- **React Hook Form** - Performant form management
- **Zod 4** - Runtime schema validation
- **date-fns 4** - Modern date manipulation with proper locale support

### Backend & Database
- **Next.js API Routes** - Full-featured RESTful API
- **Prisma ORM 6** - Type-safe database access with migrations
- **PostgreSQL** - Production database (Vercel Postgres)
- **SQLite** - Development database option
- **NextAuth.js v5** - Complete authentication solution
- **bcryptjs** - Secure password hashing
- **Encryption** - AES-256-CBC for sensitive data

### Payment Processing
- **Stripe** - International payments with Google Pay
- **SimplePay SDK** - Hungarian OTP payment gateway
- **Crypto** - HMAC-SHA384 signature generation/verification
- **Webhook Handling** - Secure IPN callback processing

### Email & Notifications
- **Resend** - Modern email delivery API
- **React Email** - Beautiful HTML email templates
- **Twilio** (optional) - SMS notifications

### Development & Deployment
- **ESLint 9** - Advanced code linting
- **TypeScript 5** - Static analysis and type checking
- **Vercel** - Edge deployment platform
- **Git** - Version control
- **Turbopack** - Fast Next.js bundler

## Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Steps

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Database
# Development (SQLite)
DATABASE_URL="file:./dev.db"
# Production (PostgreSQL - Vercel auto-provides)
# DATABASE_URL="${POSTGRES_PRISMA_URL}"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl"
AUTH_TRUST_HOST="true"

# Encryption for sensitive data (payment keys, etc.)
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY="your-encryption-key-32-chars-minimum"

# Email Notifications (Optional but recommended)
# Get API key from: https://resend.com/api-keys
RESEND_API_KEY="re_xxxxxxxxxxxx"

# Payment Providers (Optional - configure in Admin UI or here)
# Stripe
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx"

# SimplePay (Hungarian OTP)
SIMPLEPAY_MERCHANT_ID="MERCHANT-12345678"
SIMPLEPAY_SECRET_KEY="your-simplepay-secret"
SIMPLEPAY_SANDBOX="true"  # Set to false for production
```

**Generate secrets:**
```bash
# NextAuth secret
openssl rand -base64 32

# Encryption key (for payment credentials)
openssl rand -hex 32
```

3. **Initialize database:**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

4. **Start development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Demo Login

After running the seed script, you can log in with:
- **Email:** admin@pizzeriaromana.hu
- **Password:** admin123

## Project Structure

```
rezervapp/
├── app/                              # Next.js 16 App Router
│   ├── admin/                       # Admin dashboard pages
│   │   ├── bookings/                # Booking management
│   │   ├── tables/                  # Table management
│   │   ├── analytics/               # Analytics dashboard
│   │   ├── settings/                # Restaurant settings
│   │   └── waitlist/                # Waitlist management
│   ├── api/                         # API endpoints
│   │   ├── auth/                    # NextAuth v5 configuration
│   │   ├── bookings/                # Booking CRUD operations
│   │   ├── tables/                  # Table CRUD operations
│   │   ├── payments/                # Payment processing
│   │   │   ├── create-checkout/    # Stripe checkout
│   │   │   ├── simplepay-checkout/ # SimplePay checkout
│   │   │   ├── simplepay-ipn/      # SimplePay IPN webhook
│   │   │   └── webhook/            # Stripe webhook
│   │   ├── admin/                   # Admin-only endpoints
│   │   │   ├── stripe-config/      # Stripe configuration
│   │   │   └── simplepay-config/   # SimplePay configuration
│   │   └── settings/                # Settings API
│   ├── booking/                     # Public booking pages
│   │   ├── cancel/[token]/         # Cancel booking
│   │   └── edit/[token]/           # Edit booking
│   └── login/                       # Authentication page
├── components/                      # React components
│   ├── admin/                      # Admin-specific components
│   │   ├── bookings-view.tsx       # Main bookings view
│   │   ├── bookings-list.tsx       # List view
│   │   ├── bookings-calendar.tsx   # Calendar view
│   │   ├── table-map.tsx           # Table map view
│   │   ├── create-booking-dialog.tsx
│   │   ├── stripe-config-form.tsx  # Stripe setup
│   │   └── simplepay-config-form.tsx # SimplePay setup
│   ├── payment/                    # Payment components
│   │   └── payment-method-selector.tsx
│   ├── modals/                     # Modal dialogs
│   │   └── booking-details-modal.tsx
│   └── ui/                         # shadcn/ui components
├── emails/                          # React Email templates
│   ├── booking-confirmation.tsx
│   └── payment-confirmation.tsx
├── lib/                             # Utility functions & SDKs
│   ├── auth.ts                     # NextAuth configuration
│   ├── email.ts                    # Email sending
│   ├── sms.ts                      # SMS notifications
│   ├── stripe.ts                   # Stripe SDK
│   ├── simplepay.ts                # SimplePay SDK
│   ├── encryption.ts               # AES-256 encryption
│   ├── prisma.ts                   # Prisma client
│   └── utils.ts                    # Helper functions
├── prisma/                          # Database layer
│   ├── schema.prisma               # Database schema
│   ├── seed.ts                     # Demo data seeder
│   └── migrations/                 # Database migrations
└── types/                           # TypeScript definitions
    └── next-auth.d.ts              # NextAuth type extensions
```

## Database Schema

### Main Models:
- **Restaurant** - Restaurant information
- **Table** - Tables with capacity and location
- **Booking** - Bookings with status and datetime
- **Guest** - Guest profiles with VIP status
- **Staff** - Staff accounts with roles
- **Waitlist** - Waitlist guests

## Development

### Useful Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Production server
npm start

# Prisma Studio (database UI)
npx prisma studio

# Database migration
npx prisma migrate dev

# Seed database
npx prisma db seed

# Linting
npm run lint
```

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Break components into small modules
- Use Server Components where possible
- Minimize Client Components

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login (NextAuth)
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session

### Bookings
- `GET /api/bookings` - List all bookings with filters
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get booking details
- `PATCH /api/bookings/[id]` - Update booking status/details
- `DELETE /api/bookings/[id]` - Delete booking

### Tables
- `GET /api/tables` - List all tables
- `POST /api/tables` - Create new table
- `PATCH /api/tables/[id]` - Update table
- `DELETE /api/tables/[id]` - Delete table (with validation)

### Payments
- `POST /api/payments/create-checkout` - Create Stripe checkout session
- `POST /api/payments/simplepay-checkout` - Create SimplePay payment
- `POST /api/payments/simplepay-ipn` - SimplePay IPN webhook handler
- `POST /api/payments/webhook` - Stripe webhook handler

### Admin Configuration
- `POST /api/admin/stripe-config` - Save Stripe credentials
- `DELETE /api/admin/stripe-config` - Remove Stripe config
- `GET /api/admin/stripe-config` - Get Stripe config status
- `POST /api/admin/simplepay-config` - Save SimplePay credentials
- `DELETE /api/admin/simplepay-config` - Remove SimplePay config
- `GET /api/admin/simplepay-config` - Get SimplePay config status

### Settings
- `GET /api/settings` - Get restaurant settings
- `PATCH /api/settings` - Update restaurant settings

## Configuration

### Email Notifications

To use email functionality, get a Resend API key:

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add to `.env` file: `RESEND_API_KEY=your_key`

If no API key is set, emails will be logged to console in development mode.

### Payment Provider Setup

#### Stripe (Card + Google Pay)

1. **Create Stripe Account:**
   - Sign up at [stripe.com](https://stripe.com)
   - Get your API keys from Dashboard

2. **Configure Stripe:**
   - Add to `.env`:
     ```env
     STRIPE_SECRET_KEY=sk_test_xxx
     STRIPE_WEBHOOK_SECRET=whsec_xxx
     ```
   - OR configure in Admin UI → Settings → Stripe Config

3. **Enable Google Pay:**
   - Go to Stripe Dashboard → Settings → Payment methods
   - Under "Wallets" section, enable Google Pay
   - No code changes needed - works automatically!

4. **Setup Webhook:**
   - Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/payments/webhook`
   - Select events: `checkout.session.completed`

#### SimplePay (Hungarian OTP Gateway)

1. **Get SimplePay Account:**
   - Contact OTP SimplePay for merchant account
   - Get Merchant ID and Secret Key

2. **Configure SimplePay:**
   - Add to `.env`:
     ```env
     SIMPLEPAY_MERCHANT_ID=MERCHANT-12345678
     SIMPLEPAY_SECRET_KEY=your_secret_key
     SIMPLEPAY_SANDBOX=true  # false for production
     ```
   - OR configure in Admin UI → Settings → SimplePay Config

3. **Setup IPN (Instant Payment Notification):**
   - SimplePay Merchant Admin → IPN Settings
   - Add IPN URL: `https://yourdomain.com/api/payments/simplepay-ipn`
   - The system automatically verifies signatures

4. **Test with Sandbox:**
   - Use sandbox mode for testing
   - SimplePay provides test card numbers
   - Switch to production when ready

### Security & Encryption

**Generate Encryption Key:**
```bash
openssl rand -hex 32
```

Add to `.env`:
```env
ENCRYPTION_KEY=your_generated_key_here
```

This key is used to encrypt:
- Stripe API keys (if stored in database)
- SimplePay credentials (if stored in database)
- Any other sensitive merchant data

**Important:** Never commit this key to version control!

### NextAuth Secret Generation

```bash
openssl rand -base64 32
```

Copy the generated value to the `NEXTAUTH_SECRET` variable.

## MVP Status & Roadmap

### ✅ Phase 1: Core Admin Features (COMPLETE)
All core admin features are **complete and production-ready**:
- ✅ Admin authentication & dashboard
- ✅ Booking management (list + calendar + table map views)
- ✅ Table management (CRUD with validation)
- ✅ Guest tracking with history
- ✅ Email notifications (confirmation, reminders)
- ✅ Public cancellation page
- ✅ **Payment integration (Stripe + SimplePay + Google Pay)**
- ✅ Encrypted credential storage
- ✅ Deployment ready (Vercel)

### ✅ Phase 2: Payment Integration (COMPLETE)
**All payment features implemented:**
- ✅ Stripe integration (international cards)
- ✅ Google Pay support (automatic via Stripe)
- ✅ SimplePay integration (Hungarian OTP)
- ✅ Multi-provider support
- ✅ Payment method selection UI
- ✅ Webhook/IPN handling
- ✅ Signature verification (HMAC-SHA384)
- ✅ Secure credential encryption (AES-256)
- ✅ Admin configuration UI
- ✅ Sandbox & production modes

### 🚧 Phase 3: Public Booking System (NEXT)
**Priority features to implement:**
- [ ] Public booking form (guest-facing website)
- [ ] Date & time picker with availability checking
- [ ] Real-time table availability validation
- [ ] Booking conflict prevention
- [ ] Operating hours management
- [ ] Multi-language support (HU/EN)
- [ ] Mobile-responsive booking flow

### 📋 Phase 4: Multi-Tenant SaaS (PLANNED)
**Transform into SaaS platform:**
- [ ] Subdomain routing (*.rezervapp.com)
- [ ] Restaurant onboarding flow
- [ ] Subscription management (Stripe Billing)
- [ ] Pricing tiers (Free/Pro/Enterprise)
- [ ] Custom domain support
- [ ] White-label options
- [ ] Central admin dashboard

### 📋 Phase 5: Extended Features (FUTURE)
**Notifications & Communication:**
- [ ] SMS notifications (Twilio integration)
- [ ] 24-hour reminder automation
- [ ] WhatsApp notifications
- [ ] Customizable email templates

**Analytics & Reporting:**
- ✅ Basic analytics dashboard (COMPLETE)
- [ ] Advanced booking statistics
- [ ] Table utilization heatmaps
- [ ] Revenue reporting
- [ ] No-show rate tracking
- [ ] Peak hours analysis
- [ ] Export functions (CSV, PDF)

**Additional Features:**
- [ ] Advanced waitlist management
- [ ] Booking modification flow (date/time/table)
- [ ] Guest preferences & allergies database
- [ ] Deposit/prepayment options
- [ ] QR code table ordering
- [ ] Guest reviews and ratings
- [ ] Loyalty program
- [ ] Mobile apps (iOS/Android)

## Payment Security

### How We Protect Payment Data

**1. No Sensitive Data Storage:**
- Credit card numbers are never stored in our database
- All card processing happens directly on Stripe/SimplePay servers
- We only store transaction IDs for reference

**2. Encrypted Credentials:**
- Payment provider API keys encrypted with AES-256-CBC
- Encryption key never committed to version control
- Separate encryption for each credential type

**3. Signature Verification:**
- All payment callbacks verified with HMAC signatures
- SimplePay: HMAC-SHA384 signature validation
- Stripe: Official webhook signature verification
- Invalid signatures are rejected immediately

**4. HTTPS Only:**
- All payment endpoints require HTTPS in production
- Vercel automatically provides SSL certificates
- HTTP requests automatically upgraded to HTTPS

**5. PCI Compliance:**
- Using PCI-DSS Level 1 certified providers (Stripe, SimplePay)
- No card data touches our servers
- Hosted payment pages (Stripe Checkout, SimplePay)

### Testing Payment Integration

**Stripe Test Cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
Any future expiry date, any 3-digit CVC
```

**SimplePay Sandbox:**
- Contact SimplePay support for test credentials
- Use sandbox mode: `SIMPLEPAY_SANDBOX=true`
- Test card numbers provided by SimplePay documentation

## Changelog

### v2.0.0 - Payment Integration (2025-01)
- ✅ Added Stripe payment integration
- ✅ Added Google Pay support (automatic via Stripe)
- ✅ Added SimplePay (OTP) Hungarian payment gateway
- ✅ Multi-payment provider architecture
- ✅ Payment method selection UI
- ✅ Encrypted credential storage (AES-256)
- ✅ Webhook/IPN handlers with signature verification
- ✅ Admin payment configuration interface
- ✅ Fixed date-fns v4 locale imports
- ✅ Fixed FullCalendar Hungarian locale
- ✅ PostgreSQL support for production

### v1.0.0 - Core Features (2024-12)
- ✅ Admin authentication system
- ✅ Booking management (CRUD)
- ✅ Multiple booking views (list, calendar, map)
- ✅ Table management
- ✅ Guest tracking with history
- ✅ Email notifications (Resend)
- ✅ Public booking cancellation
- ✅ Dashboard with statistics
- ✅ Vercel deployment

## License

MIT License - free to use in your own projects.

## Contact & Support

**Developer:** [Thsandorh](https://github.com/Thsandorh)

**Issues & Feature Requests:** [GitHub Issues](https://github.com/Thsandorh/RezervApp/issues)

**Payment Integration Questions:**
- Stripe: [Stripe Documentation](https://docs.stripe.com)
- SimplePay: [SimplePay Support](https://simplepartner.hu)

---

**🎉 Production Ready!** Complete restaurant management system with integrated payment processing.
