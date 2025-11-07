import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Clearing demo data...')

  // Töröljük a foglalásokat
  const deletedBookings = await prisma.booking.deleteMany({})
  console.log(`✅ Deleted ${deletedBookings.count} bookings`)

  // Töröljük a vendégeket
  const deletedGuests = await prisma.guest.deleteMany({})
  console.log(`✅ Deleted ${deletedGuests.count} guests`)

  // Töröljük az asztalokat
  const deletedTables = await prisma.table.deleteMany({})
  console.log(`✅ Deleted ${deletedTables.count} tables`)

  // Staff és restaurant megtartjuk, mert azok kellenek a működéshez

  console.log('\n🎉 Demo data cleared successfully!')
  console.log('ℹ️  Restaurant and staff accounts were preserved.')
}

main()
  .catch((e) => {
    console.error('❌ Error clearing data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
