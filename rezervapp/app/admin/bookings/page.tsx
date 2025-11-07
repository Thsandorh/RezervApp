import { prisma } from "@/lib/prisma"
import { BookingsView } from "@/components/admin/bookings-view"
import { CreateBookingDialog } from "@/components/admin/create-booking-dialog"

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  // Get restaurant
  const restaurant = await prisma.restaurant.findFirst()

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Még nincs étterem regisztrálva</h2>
        <p className="text-muted-foreground">
          Először hozz létre egy éttermet a beállításokban.
        </p>
      </div>
    )
  }

  // Fetch bookings with guest and table
  const bookings = await prisma.booking.findMany({
    where: {
      restaurantId: restaurant.id,
    },
    include: {
      guest: true,
      table: true,
    },
    orderBy: {
      bookingDate: 'desc',
    },
  })

  // Fetch tables
  const tables = await prisma.table.findMany({
    where: {
      restaurantId: restaurant.id,
    },
    orderBy: {
      name: 'asc',
    },
  })

  // Serialize dates to strings for client components
  const serializedBookings = bookings.map(booking => ({
    id: booking.id,
    bookingDate: booking.bookingDate.toISOString(),
    partySize: booking.partySize,
    duration: booking.duration,
    status: booking.status,
    specialRequests: booking.specialRequests,
    internalNotes: booking.internalNotes,
    guest: {
      firstName: booking.guest.firstName,
      lastName: booking.guest.lastName,
      email: booking.guest.email,
      phone: booking.guest.phone,
    },
    table: booking.table ? {
      id: booking.table.id,
      name: booking.table.name,
    } : null,
  }))

  const serializedTables = tables.map(table => ({
    id: table.id,
    name: table.name,
    capacity: table.capacity,
    location: table.location,
    isActive: table.isActive,
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Foglalások</h1>
          <p className="text-muted-foreground mt-1">
            Összes foglalás kezelése és megtekintése
          </p>
        </div>
        <CreateBookingDialog restaurantId={restaurant.id} />
      </div>

      {/* Bookings View */}
      <BookingsView bookings={serializedBookings} tables={serializedTables} />
    </div>
  )
}
