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

  // Serialize dates to strings for client component
  const serializedBookings = bookings.map(booking => ({
    ...booking,
    bookingDate: booking.bookingDate.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
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

      <BookingsView bookings={serializedBookings as any} tables={tables} />
    </div>
  )
}
