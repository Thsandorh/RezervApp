import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

async function getBookings() {
  return await prisma.booking.findMany({
    include: {
      guest: true,
      table: true,
    },
    orderBy: {
      bookingDate: 'desc',
    },
    take: 50, // Latest 50 bookings
  })
}

export default async function BookingsPage() {
  const bookings = await getBookings()

  return (
    <div className="p-8">
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Dátum</th>
                  <th className="text-left p-2">Időpont</th>
                  <th className="text-left p-2">Vendég</th>
                  <th className="text-left p-2">Telefon</th>
                  <th className="text-left p-2">Létszám</th>
                  <th className="text-left p-2">Asztal</th>
                  <th className="text-left p-2">Státusz</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      {format(new Date(booking.bookingDate), 'yyyy. MM. dd.')}
                    </td>
                    <td className="p-2">
                      {format(new Date(booking.bookingDate), 'HH:mm')}
                    </td>
                    <td className="p-2">
                      {booking.guest.lastName} {booking.guest.firstName}
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {booking.guest.phone}
                    </td>
                    <td className="p-2">{booking.partySize} fő</td>
                    <td className="p-2">
                      {booking.table?.name || 'Nincs hozzárendelve'}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {bookings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Még nincs foglalás.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
