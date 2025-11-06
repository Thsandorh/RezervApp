# RezervApp

> **Status: ✅ MVP Complete and Production Ready**

Professional restaurant reservation and management system for Hungarian restaurants.

## Overview

RezervApp is a full-stack SaaS application that simplifies restaurant booking management. The system enables online guest reservations, table tracking, and provides a comprehensive admin interface for restaurant staff.

## Features

### ✅ User Authentication
- Secure login with NextAuth.js
- JWT session management
- Role-based access control (admin/staff/manager)
- Protected admin routes with middleware

### ✅ Booking Management
- View detailed booking information
- Manage booking statuses:
  - PENDING (Awaiting confirmation)
  - CONFIRMED (Confirmed)
  - SEATED (Guest seated)
  - COMPLETED (Completed)
  - CANCELLED (Cancelled)
  - NO_SHOW (No show)
- Add internal notes to bookings
- Delete bookings from admin panel
- Switch between list and calendar views
- FullCalendar integration with Hungarian localization

### ✅ Email Notifications
- Automatic booking confirmation emails
- Resend API integration
- React Email HTML templates
- Hungarian language content with formatting
- Cancellation link generation

### ✅ Public Booking Cancellation
- Token-based secure access
- Two-step confirmation process
- Time-based warnings (< 2 hours)
- Booking status validation

### ✅ Table Management
- Create, edit, and delete tables
- Set capacity and location
- Group by location
- Unique name validation
- Protection against deletion of tables with active bookings

### ✅ Guest Tracking
- Guest profile management
- Booking history
- VIP status marking
- No-show counter
- Phone number and email management

### ✅ Dashboard
- Booking statistics
- Today's bookings overview
- Quick access to main features
- Guest and table summaries

## Tech Stack

### Frontend
- **Next.js 14** - App Router and Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Reusable UI components
- **Radix UI** - Headless UI primitives
- **FullCalendar** - Calendar integration
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - RESTful API endpoints
- **Prisma ORM** - Type-safe database access
- **SQLite** - Development database
- **NextAuth.js v5** - Authentication and session management
- **bcryptjs** - Password hashing

### Email & Notifications
- **Resend** - Email delivery API
- **React Email** - Email template system

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

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

Edit the `.env` file:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Email (optional)
RESEND_API_KEY="your-resend-api-key"
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
├── app/                      # Next.js App Router
│   ├── admin/               # Admin dashboard pages
│   │   ├── bookings/        # Booking management
│   │   └── tables/          # Table management
│   ├── api/                 # API endpoints
│   │   ├── auth/            # NextAuth configuration
│   │   ├── bookings/        # Booking CRUD
│   │   └── tables/          # Table CRUD
│   ├── booking/             # Public booking pages
│   └── login/               # Login page
├── components/              # React components
│   ├── admin/              # Admin-specific components
│   ├── modals/             # Modal dialogs
│   └── ui/                 # Reusable UI components
├── emails/                  # Email templates
├── lib/                     # Utility functions
│   ├── auth.ts             # NextAuth configuration
│   ├── email.ts            # Email sending
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Helper functions
├── prisma/                  # Database schema and seed
│   ├── schema.prisma       # Prisma schema
│   └── seed.ts             # Demo data
└── types/                   # TypeScript type definitions
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

### Bookings
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get booking details
- `PATCH /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Delete booking

### Tables
- `GET /api/tables` - List all tables
- `POST /api/tables` - Create new table
- `PATCH /api/tables/[id]` - Update table
- `DELETE /api/tables/[id]` - Delete table

## Configuration

### Email Notifications

To use email functionality, get a Resend API key:

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add to `.env` file: `RESEND_API_KEY=your_key`

If no API key is set, emails will be logged to console in development mode.

### NextAuth Secret Generation

```bash
openssl rand -base64 32
```

Copy the generated value to the `NEXTAUTH_SECRET` variable.

## Roadmap

### Future Features:
- [ ] Multi-tenant support for multiple restaurants
- [ ] SMS notifications
- [ ] Online payment integration
- [ ] Menu management
- [ ] QR code-based check-in
- [ ] Guest reviews and ratings
- [ ] Analytics dashboard
- [ ] Export functions (PDF, Excel)

## License

MIT License - free to use in your own projects.

## Contact

Developer: [Thsandorh](https://github.com/Thsandorh)

---

**🎉 This MVP is complete and ready to use!** All core features are implemented, tested, and documented.
