import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingsView } from "@/components/admin/bookings-view"

async function getBookings() {
  return await prisma.booking.findMany({
    include: {
      guest: true,
      table: true,
    },
    orderBy: {
      bookingDate: 'desc',
    },
    take: 100, // Latest 100 bookings
  })
}

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const bookings = await getBookings()

  // Serialize dates to strings for client component
  const serializedBookings = bookings.map(booking => ({
    ...booking,
    bookingDate: booking.bookingDate.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Foglalások</h1>
        <p className="text-muted-foreground">
          Összes foglalás kezelése és megtekintése
        </p>
      </div>

      <BookingsView bookings={serializedBookings as any} />
    </div>
  )
}
