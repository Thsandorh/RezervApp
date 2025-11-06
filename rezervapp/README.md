# RezervApp

Professzionális éttermi foglalási és menedzsment rendszer magyar éttermek számára.

## Áttekintés

RezervApp egy full-stack SaaS alkalmazás, amely leegyszerűsíti az éttermi foglalások kezelését. A rendszer lehetővé teszi a vendégek online foglalását, az asztalok nyomon követését, és átfogó admin felületet biztosít az étterem személyzetének.

## Funkciók

### ✅ Felhasználói hitelesítés
- NextAuth.js alapú biztonságos bejelentkezés
- JWT session management
- Szerepkör alapú hozzáférés-vezérlés (admin/staff/manager)
- Védett admin útvonalak middleware-rel

### ✅ Foglaláskezelés
- Részletes foglalási információk megtekintése
- Foglalási státuszok kezelése:
  - PENDING (Függőben)
  - CONFIRMED (Megerősítve)
  - SEATED (Leültetve)
  - COMPLETED (Befejezve)
  - CANCELLED (Törölve)
  - NO_SHOW (Nem jelent meg)
- Belső jegyzetek hozzáadása foglalásokhoz
- Foglalások törlése admin felületről
- Lista és naptár nézet közötti váltás
- FullCalendar integráció magyar lokalizációval

### ✅ Email értesítések
- Automatikus foglalás visszaigazoló emailek
- Resend API integráció
- React Email alapú HTML sablonok
- Magyar nyelvű tartalom formázással
- Lemondási link generálás

### ✅ Publikus foglalás lemondás
- Token-alapú biztonságos hozzáférés
- Kétlépcsős megerősítési folyamat
- Időalapú figyelmeztetések (< 2 óra)
- Foglalási státusz validáció

### ✅ Asztalkezelés
- Asztalok létrehozása, szerkesztése, törlése
- Kapacitás és elhelyezkedés megadása
- Helyszín szerinti csoportosítás
- Egyedi névvalidáció
- Védelem aktív foglalások ellen

### ✅ Vendég nyomon követés
- Vendég profil kezelés
- Foglalási előzmények
- VIP státusz jelölés
- No-show számláló
- Telefonszám és email kezelés

### ✅ Dashboard
- Foglalási statisztikák
- Mai foglalások áttekintése
- Gyors hozzáférés főbb funkciókhoz
- Vendég és asztal összesítők

## Technológiai stack

### Frontend
- **Next.js 14** - App Router és Server Components
- **TypeScript** - Type-safe fejlesztés
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Újrafelhasználható UI komponensek
- **Radix UI** - Headless UI primitívek
- **FullCalendar** - Naptár integráció
- **React Hook Form** - Form kezelés
- **Zod** - Schema validáció

### Backend
- **Next.js API Routes** - RESTful API végpontok
- **Prisma ORM** - Típusbiztos adatbázis hozzáférés
- **SQLite** - Development adatbázis
- **NextAuth.js v5** - Hitelesítés és session kezelés
- **bcryptjs** - Jelszó hashelés

### Email & értesítések
- **Resend** - Email küldés API
- **React Email** - Email template rendszer

### Fejlesztői eszközök
- **ESLint** - Kód linting
- **Prettier** - Kód formázás
- **TypeScript** - Statikus típusellenőrzés

## Telepítés

### Előfeltételek
- Node.js 18+ telepítve
- npm vagy yarn package manager

### Lépések

1. **Függőségek telepítése:**
```bash
npm install
```

2. **Környezeti változók beállítása:**
```bash
cp .env.example .env
```

Szerkeszd a `.env` fájlt:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Email (opcionális)
RESEND_API_KEY="your-resend-api-key"
```

3. **Adatbázis inicializálása:**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

4. **Fejlesztői szerver indítása:**
```bash
npm run dev
```

Az alkalmazás elérhető lesz a `http://localhost:3000` címen.

### Demo bejelentkezés

Seed script után elérhető teszt fiók:
- **Email:** admin@pizzeriaromana.hu
- **Jelszó:** admin123

## Projekt struktúra

```
rezervapp/
├── app/                      # Next.js App Router
│   ├── admin/               # Admin dashboard oldálak
│   │   ├── bookings/        # Foglalások kezelése
│   │   └── tables/          # Asztalok kezelése
│   ├── api/                 # API végpontok
│   │   ├── auth/            # NextAuth konfigurálció
│   │   ├── bookings/        # Foglalás CRUD
│   │   └── tables/          # Asztal CRUD
│   ├── booking/             # Publikus foglalás oldalak
│   └── login/               # Bejelentkezés
├── components/              # React komponensek
│   ├── admin/              # Admin-specifikus komponensek
│   ├── modals/             # Modal dialógusok
│   └── ui/                 # Újrafelhasználható UI komponensek
├── emails/                  # Email sablonok
├── lib/                     # Utility függvények
│   ├── auth.ts             # NextAuth konfiguráció
│   ├── email.ts            # Email küldés
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Helper függvények
├── prisma/                  # Adatbázis schema és seed
│   ├── schema.prisma       # Prisma schema
│   └── seed.ts             # Demo adatok
└── types/                   # TypeScript típusdefiníciók

```

## Adatbázis séma

### Fő modellek:
- **Restaurant** - Étterem információk
- **Table** - Asztalok kapacitással és helyszínnel
- **Booking** - Foglalások státusszal és időponttal
- **Guest** - Vendég profilok VIP státusszal
- **Staff** - Személyzet fiókok szerepkörökkel
- **Waitlist** - Várólistás vendégek

## Fejlesztés

### Hasznos parancsok

```bash
# Development szerver
npm run dev

# Production build
npm run build

# Production szerver
npm start

# Prisma Studio (adatbázis UI)
npx prisma studio

# Adatbázis migrálcia
npx prisma migrate dev

# Seed adatbázis
npx prisma db seed

# Linting
npm run lint
```

### Kód stílus
- TypeScript strict mode használata
- ESLint szabályok betartása
- Komponensek kis modulokba tördelése
- Server Components használata ahol lehetséges
- Client Components minimalizálása

## API végpontok

### Foglalások
- `GET /api/bookings` - Összes foglalás listázása
- `POST /api/bookings` - Új foglalás létrehozása
- `GET /api/bookings/[id]` - Foglalás részletei
- `PATCH /api/bookings/[id]` - Foglalás frissítése
- `DELETE /api/bookings/[id]` - Foglalás törlése

### Asztalok
- `GET /api/tables` - Összes asztal listázása
- `POST /api/tables` - Új asztal létrehozása
- `PATCH /api/tables/[id]` - Asztal frissítése
- `DELETE /api/tables/[id]` - Asztal törlése

## Konfigurálás

### Email értesítések

Email funkcionalitás használatához szerezz be egy Resend API kulcsot:

1. Regisztrálj a [resend.com](https://resend.com) oldalon
2. Hozz létre egy API kulcsot
3. Add hozzá a `.env` fájlhoz: `RESEND_API_KEY=your_key`

Ha nincs beállítva API kulcs, az emailek konzolra logolódnak development módban.

### NextAuth Secret generálás

```bash
openssl rand -base64 32
```

Másold be a generált értéket a `NEXTAUTH_SECRET` változóba.

## Következő lépések

### Tervezett funkciók:
- [ ] Multi-tenant támogatás több étteremhez
- [ ] SMS értesítések
- [ ] Online fizetés integráció
- [ ] Étlap kezelés
- [ ] QR kód alapú check-in
- [ ] Vendég értékelések
- [ ] Analytics dashboard
- [ ] Export funkciók (PDF, Excel)

## Licensz

MIT License - szabad felhasználás saját projektekben.

## Kapcsolat

Fejlesztő: [Thsandorh](https://github.com/Thsandorh)
