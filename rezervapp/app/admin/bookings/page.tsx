import { prisma } from "@/lib/prisma"
import { BookingsView } from "@/components/admin/bookings-view"
import { CreateBookingDialog } from "@/components/admin/create-booking-dialog"

async function getData() {
  const restaurant = await prisma.restaurant.findFirst()

  if (!restaurant) {
    return { bookings: [], tables: [], restaurant: null }
  }

  const [bookings, tables] = await Promise.all([
    prisma.booking.findMany({
      include: {
        guest: true,
        table: true,
      },
      orderBy: {
        bookingDate: 'desc',
      },
      take: 100, // Latest 100 bookings
    }),
    prisma.table.findMany({
      where: {
        restaurantId: restaurant.id,
      },
      orderBy: {
        name: 'asc',
      },
    })
  ])

  return { bookings, tables, restaurant }
}

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const { bookings, tables, restaurant } = await getData()

  // Serialize dates for client component - only include fields needed by components
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

  // Serialize tables - only include fields needed by components
  const serializedTables = tables.map(table => ({
    id: table.id,
    name: table.name,
    capacity: table.capacity,
    location: table.location,
    isActive: table.isActive,
  }))

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Foglalások</h1>
          <p className="text-muted-foreground">
            Összes foglalás kezelése és megtekintése
          </p>
        </div>
        {restaurant && <CreateBookingDialog restaurantId={restaurant.id} />}
      </div>

      <BookingsView bookings={serializedBookings} tables={serializedTables} />
    </div>
  )
}
