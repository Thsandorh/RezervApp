import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash a simple password for staff accounts
  const hashedPassword = await hash('password123', 10)

  // 1. Létrehozunk egy példa éttermet
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'pizzeria-romana' },
    update: {},
    create: {
      name: 'Pizzeria Romana',
      slug: 'pizzeria-romana',
      email: 'info@pizzeriaromana.hu',
      phone: '+36301234567',
      address: 'Fő utca 12',
      city: 'Budapest',
      postalCode: '1011',
      timeZone: 'Europe/Budapest',
      currency: 'HUF',
      openingHours: JSON.stringify({
        monday: { open: '11:00', close: '22:00', closed: false },
        tuesday: { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday: { open: '11:00', close: '22:00', closed: false },
        friday: { open: '11:00', close: '23:00', closed: false },
        saturday: { open: '12:00', close: '23:00', closed: false },
        sunday: { open: '12:00', close: '21:00', closed: false },
      }),
      slotDuration: 30,
      maxAdvanceDays: 60,
      minAdvanceHours: 2,
    },
  })

  console.log('✅ Restaurant created:', restaurant.name)

  // 2. Létrehozunk staff account-ot
  const staff = await prisma.staff.upsert({
    where: { email: 'admin@pizzeriaromana.hu' },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: 'Admin User',
      email: 'admin@pizzeriaromana.hu',
      password: hashedPassword,
      role: 'OWNER',
      isActive: true,
    },
  })

  console.log('✅ Staff created:', staff.email)

  // 3. Létrehozunk asztalokat
  const tables = [
    { name: 'Asztal 1', capacity: 2, location: 'Belső terem' },
    { name: 'Asztal 2', capacity: 2, location: 'Belső terem' },
    { name: 'Asztal 3', capacity: 4, location: 'Belső terem' },
    { name: 'Asztal 4', capacity: 4, location: 'Belső terem' },
    { name: 'Asztal 5', capacity: 6, location: 'Belső terem' },
    { name: 'Terasz 1', capacity: 2, location: 'Terasz' },
    { name: 'Terasz 2', capacity: 4, location: 'Terasz' },
    { name: 'VIP 1', capacity: 8, location: 'VIP szoba' },
  ]

  for (const table of tables) {
    await prisma.table.upsert({
      where: {
        restaurantId_name: {
          restaurantId: restaurant.id,
          name: table.name,
        },
      },
      update: {},
      create: {
        restaurantId: restaurant.id,
        ...table,
        isActive: true,
      },
    })
  }

  console.log(`✅ Created ${tables.length} tables`)

  // 4. Létrehozunk vendégeket
  const guests = [
    {
      firstName: 'Kovács',
      lastName: 'János',
      email: 'kovacs.janos@example.com',
      phone: '+36301111111',
      notes: 'Gluténérzékeny',
    },
    {
      firstName: 'Nagy',
      lastName: 'Anna',
      email: 'nagy.anna@example.com',
      phone: '+36302222222',
      vip: true,
    },
    {
      firstName: 'Szabó',
      lastName: 'Péter',
      email: 'szabo.peter@example.com',
      phone: '+36303333333',
    },
    {
      firstName: 'Kiss',
      lastName: 'Éva',
      email: 'kiss.eva@example.com',
      phone: '+36304444444',
      notes: 'Vegetáriánus',
    },
  ]

  for (const guest of guests) {
    await prisma.guest.upsert({
      where: {
        restaurantId_phone: {
          restaurantId: restaurant.id,
          phone: guest.phone,
        },
      },
      update: {},
      create: {
        restaurantId: restaurant.id,
        ...guest,
      },
    })
  }

  console.log(`✅ Created ${guests.length} guests`)

  // 5. Létrehozunk foglalásokat (mai és jövőbeli)
  const allGuests = await prisma.guest.findMany({
    where: { restaurantId: restaurant.id },
  })
  const allTables = await prisma.table.findMany({
    where: { restaurantId: restaurant.id },
  })

  const today = new Date()
  today.setHours(18, 0, 0, 0) // Ma 18:00

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(19, 0, 0, 0) // Holnap 19:00

  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(20, 0, 0, 0) // Jövő hét 20:00

  const bookings = [
    {
      guestId: allGuests[0].id,
      tableId: allTables[0].id,
      bookingDate: today,
      partySize: 2,
      status: 'CONFIRMED',
      specialRequests: 'Ablak melletti asztal kérek',
    },
    {
      guestId: allGuests[1].id,
      tableId: allTables[2].id,
      bookingDate: today,
      partySize: 4,
      status: 'CONFIRMED',
      specialRequests: null,
    },
    {
      guestId: allGuests[2].id,
      tableId: allTables[5].id,
      bookingDate: tomorrow,
      partySize: 2,
      status: 'PENDING',
      specialRequests: 'Teraszon szeretnénk ülni',
    },
    {
      guestId: allGuests[3].id,
      tableId: allTables[7].id,
      bookingDate: nextWeek,
      partySize: 6,
      status: 'CONFIRMED',
      specialRequests: 'Születésnapi vacsora',
    },
  ]

  for (const booking of bookings) {
    await prisma.booking.create({
      data: {
        restaurantId: restaurant.id,
        ...booking,
        duration: 120,
        confirmationSent: true,
        reminderSent: false,
      },
    })
  }

  console.log(`✅ Created ${bookings.length} bookings`)

  // 6. Frissítjük a vendégek statisztikáit
  for (const guest of allGuests) {
    const bookingCount = await prisma.booking.count({
      where: { guestId: guest.id },
    })
    await prisma.guest.update({
      where: { id: guest.id },
      data: { totalBookings: bookingCount },
    })
  }

  console.log('✅ Updated guest statistics')

  console.log('\n🎉 Seeding completed successfully!')
  console.log('\n📝 Login credentials:')
  console.log('   Email: admin@pizzeriaromana.hu')
  console.log('   Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
