import { prisma } from "@/lib/prisma"
import { BookingsList } from "@/components/admin/bookings-list"
import { CreateBookingDialog } from "@/components/admin/create-booking-dialog"

async function getData() {
  const restaurant = await prisma.restaurant.findFirst()

  if (!restaurant) {
    return { bookings: [], restaurant: null }
  }

  const bookings = await prisma.booking.findMany({
    include: {
      guest: true,
      table: true,
    },
    orderBy: {
      bookingDate: 'desc',
    },
    take: 100,
  })

  return { bookings, restaurant }
}

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const { bookings, restaurant } = await getData()

  // Serialize dates to strings for client component
  const serializedBookings = bookings.map(booking => ({
    ...booking,
    bookingDate: booking.bookingDate.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  }))

  const handleUpdate = () => {
    // This will be handled by router.refresh() in the client component
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Foglalások</h1>
          <p className="text-muted-foreground">
            Összes foglalás kezelése és megtekintése ({serializedBookings.length})
          </p>
        </div>
        {restaurant && <CreateBookingDialog restaurantId={restaurant.id} />}
      </div>

      <BookingsList bookings={serializedBookings as any} onUpdate={handleUpdate} />
    </div>
  )
}
