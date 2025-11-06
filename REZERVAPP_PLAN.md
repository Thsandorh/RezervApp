# RezervApp - Magyar Éttermi Foglalási Rendszer

## 🎯 概概 (Executive Summary)

**Probléma**: Magyar éttermek, kávézók és bárok nagy része még mindig telefonon, Facebook üzenetben vagy papíron kezeli a foglalásokat. Ez időigényes, hibázásra ad lehetőséget, és rossz vendégélményt eredményez.

**Megoldás**: RezervApp - egy modern, magyar nyelvű SaaS platform éttermi foglaláskezelésre, asztalmenedzsmentre és vendégkommunikációra.

**Célpiac**:
- Magyarországi éttermek, kávézók, bárok
- 5-100 asztallal rendelkező helyek
- Minimális technikai tudással rendelkező üzemeltetők

---

## ✨ Főbb Funkciók (MVP)

### 1. **Vendég Oldali Funkciók** 👥
- ✅ Online foglalási rendszer (publikus link)
- ✅ Időpont választás (dátum, időpont, létszám)
- ✅ Asztaltípus választás (normál, kinti terasz, VIP, stb.)
- ✅ Vendégadatok megadása (név, telefon, email)
- ✅ Foglalás visszaigazolás email-ben és SMS-ben (magyarul!)
- ✅ Emlékeztető SMS 24 órával a foglalás előtt
- ✅ Foglalás lemondása/módosítása egyedi linkkel

### 2. **Éttermi Admin Funkciók** 🍽️
- ✅ Dashboard: Mai foglalások áttekintése
- ✅ Naptár nézet: Heti/havi foglalások
- ✅ Asztal layout konfiguráció (padlótérkép)
- ✅ Foglalás státusz kezelés:
  - Függőben (új foglalás)
  - Megerősítve
  - Vendég megérkezett
  - Lezárva
  - Lemondva / No-show
- ✅ Manuális foglalás rögzítés (telefonos foglalások számára)
- ✅ Vendéglista (vendég történet, preferenciák, allergiák)
- ✅ Nyitvatartási idők és blokkolható időpontok kezelése
- ✅ Waitlist (várólistára tévő vendégek)

### 3. **Értesítési Rendszer** 📲
- ✅ SMS küldés (magyar mobilszámokra)
- ✅ Email értesítések
- ✅ Valós idejű admin push értesítések
- ✅ Sablonok magyar nyelven (személyre szabható)

### 4. **Analitika** 📊
- ✅ Foglalási statisztikák
- ✅ Asztal kihasználtság
- ✅ No-show ráta
- ✅ Csúcsidők elemzése
- ✅ Bevétel előrejelzés (asztalforgalom alapján)

---

## 🏗️ Technikai Architektúra

### **Tech Stack**

#### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context + Zustand
- **UI Components**: shadcn/ui (magyar lokalizációval)
- **Forms**: React Hook Form + Zod validáció
- **Calendar**: React Big Calendar / FullCalendar
- **Charts**: Recharts

#### **Backend**
- **Runtime**: Node.js (v20+)
- **Framework**: Next.js API Routes / Express.js
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: NextAuth.js (email/password + Google SSO)

#### **Database**
- **Primary**: PostgreSQL (via Supabase vagy Railway)
- **Caching**: Redis (foglalás ütközések kezelésére)

#### **Integrations**
- **SMS**: Twilio (magyar számokhoz) vagy Vonage
- **Email**: Resend vagy SendGrid
- **Payments**: Stripe (későbbi premium funkciókhoz)
- **File Storage**: Cloudflare R2 vagy AWS S3 (étterem logók, menük)

#### **Deployment**
- **Hosting**: Vercel (frontend + API routes)
- **Database**: Supabase (PostgreSQL + Auth)
- **CDN**: Cloudflare

---

## 🗄️ Adatbázis Séma

### **Fő Táblák**

```prisma
// prisma/schema.prisma

model Restaurant {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique  // pl: pizzeria-romana
  email           String
  phone           String
  address         String
  city            String
  postalCode      String

  // Konfigurációk
  timeZone        String   @default("Europe/Budapest")
  currency        String   @default("HUF")

  // Nyitvatartás
  openingHours    Json     // { monday: { open: "11:00", close: "22:00", closed: false }, ... }

  // Foglalási beállítások
  slotDuration    Int      @default(30)  // perc
  maxAdvanceDays  Int      @default(60)  // Hány nappal előre lehet foglalni
  minAdvanceHours Int      @default(2)   // Min hány órával előre kell foglalni

  // Kapcsolatok
  tables          Table[]
  bookings        Booking[]
  staff           Staff[]
  guests          Guest[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Table {
  id            String   @id @default(cuid())
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  name          String   // pl: "Asztal 1", "Terasz 4"
  capacity      Int      // Hány fős
  location      String?  // "Belső terem", "Terasz", "VIP"

  // Pozíció (padlótérképhez)
  positionX     Float?
  positionY     Float?

  isActive      Boolean  @default(true)

  bookings      Booking[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([restaurantId, name])
}

model Guest {
  id            String   @id @default(cuid())
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  firstName     String
  lastName      String
  email         String?
  phone         String   // Magyar formátum: +36301234567

  // Vendég preferenciák
  notes         String?  // Allergiák, különleges kérések
  vip           Boolean  @default(false)

  // Statisztikák
  totalBookings Int      @default(0)
  noShowCount   Int      @default(0)

  bookings      Booking[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([restaurantId, phone])
  @@index([email])
}

model Booking {
  id              String   @id @default(cuid())
  restaurantId    String
  restaurant      Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  guestId         String
  guest           Guest    @relation(fields: [guestId], references: [id])

  tableId         String?
  table           Table?   @relation(fields: [tableId], references: [id])

  // Foglalás részletei
  bookingDate     DateTime // Foglalás dátuma és időpontja
  partySize       Int      // Hány fős
  duration        Int      @default(120) // Perc

  status          BookingStatus @default(PENDING)

  // Kommunikáció
  specialRequests String?
  internalNotes   String?  // Csak staff látja

  // Értesítések
  confirmationSent Boolean @default(false)
  reminderSent     Boolean @default(false)

  // Lemondás/módosítás token
  cancelToken     String   @unique @default(cuid())

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([restaurantId, bookingDate])
  @@index([status])
}

enum BookingStatus {
  PENDING       // Új foglalás, még nem megerősített
  CONFIRMED     // Megerősítve
  SEATED        // Vendég megérkezett
  COMPLETED     // Lezárva
  CANCELLED     // Lemondva (vendég által)
  NO_SHOW       // Nem jelent meg
}

model Staff {
  id            String   @id @default(cuid())
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  name          String
  email         String   @unique
  role          StaffRole @default(STAFF)

  // Auth (NextAuth user connection)
  userId        String?  @unique

  isActive      Boolean  @default(true)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum StaffRole {
  OWNER         // Tulajdonos (teljes hozzáférés)
  MANAGER       // Menedzser (majdnem minden)
  STAFF         // Személyzet (alap funkciók)
}

model Waitlist {
  id            String   @id @default(cuid())
  restaurantId  String

  guestName     String
  guestPhone    String
  partySize     Int

  status        WaitlistStatus @default(WAITING)

  createdAt     DateTime @default(now())
  notifiedAt    DateTime?
  seatedAt      DateTime?
}

enum WaitlistStatus {
  WAITING
  NOTIFIED
  SEATED
  CANCELLED
}
```

---

## 🚀 MVP Fejlesztési Terv

### **Fázis 1: Alap Foglalási Rendszer** (1-2 hét)
- [ ] Projekt setup (Next.js + Prisma + PostgreSQL)
- [ ] Adatbázis séma implementálása
- [ ] Étterem regisztráció és setup flow
- [ ] Asztal konfiguráció UI
- [ ] Nyitvatartás és időpont kezelés
- [ ] Publikus foglalási oldal
- [ ] Foglalás form validáció

### **Fázis 2: Admin Dashboard** (1 hét)
- [ ] Admin login (NextAuth)
- [ ] Dashboard: Mai foglalások listája
- [ ] Foglalás státusz változtatás
- [ ] Naptár nézet (heti/havi)
- [ ] Manuális foglalás hozzáadása
- [ ] Vendéglista oldal

### **Fázis 3: Értesítési Rendszer** (3-5 nap)
- [ ] Email integráció (Resend)
- [ ] SMS integráció (Twilio magyar számokhoz)
- [ ] Foglalás visszaigazolás küldés
- [ ] 24h emlékeztető automatizmus
- [ ] Email/SMS sablonok magyarul

### **Fázis 4: További Funkciók** (1 hét)
- [ ] Foglalás lemondása/módosítása (vendég oldal)
- [ ] Waitlist funkció
- [ ] Analitika dashboard
- [ ] Exportálás (CSV/PDF)

### **Fázis 5: Polish & Launch** (3-5 nap)
- [ ] UI/UX finomítás
- [ ] Mobil responsiveness
- [ ] Dokumentáció (magyar)
- [ ] Beta tesztelés 2-3 étteremmel
- [ ] Launch marketing oldal

---

## 💰 Üzleti Modell (Pricing)

### **Ingyenes Tier** (első 30 nap)
- 1 étterem
- Max 50 foglalás/hó
- Max 10 asztal
- Email support

### **Starter** - 9.990 Ft/hó
- 1 étterem
- Max 200 foglalás/hó
- Unlimited asztalok
- SMS értesítések (100 SMS/hó)
- Email + Chat support

### **Professional** - 19.990 Ft/hó
- 1 étterem
- Unlimited foglalások
- SMS értesítések (500 SMS/hó)
- Analitika & Riportok
- Waitlist
- Prioritás support

### **Enterprise** - Egyedi árazás
- Több étterem (láncok számára)
- API hozzáférés
- Dedikált account manager
- Custom integrations

---

## 🎨 UI/UX Tervek

### **Vendég Oldal** (Publikus Foglalás)
1. **Landing**: Étterem neve, kép, nyitvatartás
2. **Dátum választás**: Calendar picker (magyar dátumformátum)
3. **Időpont választás**: Elérhető időpontok grid-ben
4. **Létszám & Speciális kérések**: Dropdown + textarea
5. **Vendégadatok**: Név, telefon, email form
6. **Visszaigazolás**: "Foglalás sikeresen rögzítve!" + instrukciók

### **Admin Dashboard**
1. **Sidebar Navigation**:
   - 📊 Dashboard
   - 📅 Naptár
   - 🍽️ Asztalok
   - 👥 Vendégek
   - 📈 Analitika
   - ⚙️ Beállítások

2. **Dashboard főoldal**:
   - Mai foglalások timeline
   - Gyors statisztikák (mai foglalások, kihasználtság)
   - Waitlist widget
   - Közeljövő foglalások

3. **Naptár nézet**:
   - FullCalendar integráció
   - Foglalások színkódolva státusz szerint
   - Kattintásra foglalás részletek modal
   - Drag & drop asztal áthelyezés

---

## 🔒 Biztonsági Megfontolások

- **GDPR Compliance**: Vendégadatok titkosítása, adattörlési funkció
- **Rate Limiting**: Foglalási spam ellen
- **CAPTCHA**: Bot foglalások ellen
- **SMS Verification**: Telefonszám validáció
- **Secure Tokens**: Foglalás lemondási linkek egyedi tokenekkel

---

## 📈 Jövőbeli Funkciók (Post-MVP)

- [ ] QR kód menü integráció
- [ ] Előleg/foglalási díj fizetés (Stripe)
- [ ] Automata waitlist értesítés
- [ ] Több nyelv támogatás
- [ ] Mobil app (vendégeknek és staffnak)
- [ ] POS integráció (számlakövetés)
- [ ] Marketing automations (újrafoglalás kampányok)
- [ ] Loyalty program integráció

---

## 🧪 Tesztelési Terv

1. **Unit tesztek**: Kritikus business logika (foglalás ütközések, időpont validáció)
2. **Integration tesztek**: API endpoints
3. **E2E tesztek**: Teljes foglalási flow (Playwright)
4. **Load testing**: 100 egyidejű foglalás kezelése
5. **Beta tesztelés**: 3-5 valós étteremmel 2 héten keresztül

---

## 🚀 Go-To-Market Stratégia

1. **Beta program**: 10 budapesti étteremnek ingyenes 3 hónapra
2. **Tartalommarketing**: Blog magyar éttermeseknek (SEO)
3. **Social media**: Instagram/Facebook - "Elég a papíros foglalókönyvből!"
4. **Partnerségek**: Éttermes szövetségek, beszállítók
5. **Referral program**: Ajánlj egy éttermet, kapj 1 hónap ingyen

---

## 📞 Következő Lépések

Mit szeretnél elsőként látni implementálva?

1. **Adatbázis + Backend API setup**
2. **Publikus foglalási oldal (vendég oldal)**
3. **Admin dashboard prototype**
4. **Teljes MVP elkezdése**

Mondd meg, és kezdjük el építeni! 🚀
