# 🍽️ RezervApp - Magyar Éttermi Foglalási Rendszer

Modern, teljes full-stack SaaS alkalmazás magyar éttermek számára online foglaláskezeléshez.

## 🎯 MVP Funkciók

### Admin Felület (`/admin/*`)
- ✅ **Dashboard**: Mai foglalások, statisztikák, gyors áttekintés
- ✅ **Foglalások**: Összes foglalás listája dátum, vendég, státusz szerint
- ✅ **Asztalok**: Asztalkezelés lokáció szerint csoportosítva
- ✅ **Vendégek**: Vendéglista statisztikákkal (foglalások száma, no-show rate)
- ✅ **Beállítások**: Étterem adatok, nyitvatartás, foglalási beállítások

### Publikus Felület (`/book/[slug]`)
- ✅ **Foglalási oldal**: Dátum, időpont, létszám választás
- ✅ **Automatikus asztalfoglalás**: Létszám alapú asztalválasztás
- ✅ **Ütközésellenőrzés**: Ugyanazon asztalra nem lehet dupla foglalás
- ✅ **Sikeres foglalás oldal**: Megerősítés minden részlettel
- ✅ **Magyar lokalizáció**: Dátumok, címkék, hibaüzenetek magyarul

## 🚀 Gyors kezdés

### 1. Telepítés

```bash
cd rezervapp
npm install
```

### 2. Adatbázis inicializálás

```bash
# Migráció futtatása
DATABASE_URL="file:./dev.db" npm run db:migrate

# Teszt adatok betöltése
DATABASE_URL="file:./dev.db" npm run db:seed
```

### 3. Futtatás

```bash
npm run dev
```

Az alkalmazás elérhető: **http://localhost:3000**

## 📱 Használat

### Admin bejelentkezés
- Email: `admin@pizzeriaromana.hu`
- Jelszó: `password123`
- URL: http://localhost:3000/admin/dashboard

### Teszt foglalás
- URL: http://localhost:3000/book/pizzeria-romana
- Bármilyen adatot megadhatsz, a rendszer kezeli

## 🗄️ Adatbázis Séma

```
Restaurant (Étterem)
├── Tables (Asztalok)
├── Bookings (Foglalások)
├── Guests (Vendégek)
└── Staff (Személyzet)
```

### Fő modellek:
- **Restaurant**: Étterem adatok, nyitvatartás, beállítások
- **Table**: Asztalok (név, kapacitás, lokáció)
- **Booking**: Foglalások (dátum, létszám, státusz, megjegyzések)
- **Guest**: Vendégek (név, telefon, email, statisztikák)
- **Staff**: Személyzet (admin user-ek)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite + Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod validáció
- **Icons**: Lucide React
- **Date handling**: date-fns (magyar locale)

## 📂 Projekt Struktúra

```
rezervapp/
├── app/
│   ├── admin/              # Admin felület
│   │   ├── dashboard/      # Dashboard
│   │   ├── bookings/       # Foglalások
│   │   ├── tables/         # Asztalok
│   │   ├── guests/         # Vendégek
│   │   └── settings/       # Beállítások
│   ├── api/
│   │   └── bookings/       # API endpoints
│   └── book/[slug]/        # Publikus foglalás
├── components/
│   ├── admin/              # Admin komponensek
│   ├── booking/            # Foglalási komponensek
│   └── ui/                 # UI komponensek
├── lib/
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Utility funkciók
└── prisma/
    ├── schema.prisma       # Adatbázis séma
    └── seed.ts             # Seed script
```

## 🎨 Funkcionalitások részletesen

### 1. Foglalási folyamat
1. Vendég kiválasztja a dátumot, időpontot, létszámot
2. Rendszer automatikusan talál megfelelő asztalt
3. Ellenőrzi, hogy nincs-e ütközés
4. Létrehozza vagy frissíti a vendég profilt
5. Létrehozza a foglalást
6. Sikeres oldal megjelenítése

### 2. Asztal kiválasztás logika
- Létszám alapján választja ki a legkisebb megfelelő asztalt
- Preferencia: capacity >= partySize
- Ha van már foglalás ugyanabban az időpontban, másik asztalt választ

### 3. Vendég kezelés
- Telefonszám alapján automatikus vendégkeresés
- Első foglalás esetén új vendég létrehozása
- Statisztikák automatikus frissítése (totalBookings++)

## 📊 Demo Adatok

### Étterem: Pizzeria Romana
- **Slug**: `pizzeria-romana`
- **Cím**: Budapest, Fő utca 12, 1011
- **Nyitvatartás**: H-V 11:00-22:00, Szo-V 12:00-23:00

### Asztalok (8 db):
- 2 db 2 fős (Belső terem)
- 2 db 4 fős (Belső terem)
- 1 db 6 fős (Belső terem)
- 2 db 2-4 fős (Terasz)
- 1 db 8 fős (VIP szoba)

### Vendégek (4 db):
- Kovács János (gluténérzékeny)
- Nagy Anna (VIP)
- Szabó Péter
- Kiss Éva (vegetáriánus)

### Foglalások (4 db):
- Ma 18:00 - Kovács János (2 fő)
- Ma 18:00 - Nagy Anna (4 fő)
- Holnap 19:00 - Szabó Péter (2 fő)
- Jövő hét 20:00 - Kiss Éva (6 fő, születésnapi vacsora)

## 🔜 Következő lépések (Post-MVP)

### Hitelesítés
- [ ] NextAuth.js integráció
- [ ] Login/logout funkciók
- [ ] Role-based access control (Owner, Manager, Staff)

### Foglaláskezelés
- [ ] Foglalás szerkesztése (admin)
- [ ] Foglalás lemondása (vendég link-ből)
- [ ] Státusz változtatás (Seated, Completed, No-show)
- [ ] Időpont módosítás

### Értesítések
- [ ] Email integráció (Resend/SendGrid)
- [ ] SMS integráció (Twilio magyar számokhoz)
- [ ] Foglalás visszaigazolás
- [ ] 24h emlékeztető
- [ ] Lemondási link

### Asztalkezelés
- [ ] Új asztal hozzáadása
- [ ] Asztal szerkesztése/törlése
- [ ] Padlótérkép (drag & drop)
- [ ] Asztal blokkolás (karbantartás)

### Vendégkezelés
- [ ] Vendég részletes profil
- [ ] Foglalási előzmények
- [ ] Preferenciák mentése
- [ ] VIP jelölés
- [ ] Blacklist (no-show miatt)

### Analitika
- [ ] Foglalási trendek grafikonok
- [ ] Népszerű időpontok
- [ ] Asztal kihasználtság
- [ ] Revenue előrejelzés
- [ ] Export (CSV/PDF)

### UX Fejlesztések
- [ ] Naptár nézet (FullCalendar)
- [ ] Waitlist funkció
- [ ] Mobil app (React Native)
- [ ] Dark mode
- [ ] Multi-language (EN, DE)

### Integr��ciók
- [ ] Google Calendar szinkron
- [ ] POS rendszer integráció
- [ ] Stripe fizetés (előleg)
- [ ] Google/Facebook SSO

## 🐛 Ismert limitációk (MVP)

- Nincs valódi email/SMS küldés
- Nincs authentikáció (bárki eléri az admin-t)
- Nincs foglalás szerkesztés/törlés
- Nincs időpont intelligens ajánlás
- Nincs capacity checking (max vendég / nap)
- SQLite production-re nem ajánlott (PostgreSQL kellene)

## 📝 Deployment

### Vercel (ajánlott)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add DATABASE_URL környezeti változót a Vercel dashboard-on
```

### PostgreSQL átállás (production)
1. Módosítsd `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Frissítsd `.env`:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/database"
   ```
3. Futtasd a migrációt:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

## 📄 Licenc

MIT License - Szabadon felhasználható, módosítható.

## 👨‍💻 Készítette

**Thsandorh** - [GitHub](https://github.com/Thsandorh)

Modern SaaS megoldás magyar éttermek számára.

---

**Jó étvágyat és sok foglalást! 🍕🍝**

*Ha tetszik a projekt, adj egy ⭐ csillagot a GitHub-on!*
