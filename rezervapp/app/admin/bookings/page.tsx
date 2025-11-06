import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingsList } from "@/components/admin/bookings-list"

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
          Összes foglalás kezelése
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Foglalások listája ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingsList
            bookings={serializedBookings as any}
            onUpdate={() => {
              // This will trigger a revalidation
              // In practice, you might want to use router.refresh() here
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
