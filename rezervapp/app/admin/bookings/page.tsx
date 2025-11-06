import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

async function getBookings() {
  const restaurant = await prisma.restaurant.findFirst()

  if (!restaurant) {
    return null
  }

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
    take: 50,
  })

  return { restaurant, bookings }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'SEATED':
      return 'default'
    case 'COMPLETED':
      return 'secondary'
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'destructive'
    default:
      return 'default'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'Megerősítve'
    case 'PENDING':
      return 'Függőben'
    case 'SEATED':
      return 'Megérkezett'
    case 'COMPLETED':
      return 'Lezárva'
    case 'CANCELLED':
      return 'Lemondva'
    case 'NO_SHOW':
      return 'Nem jelent meg'
    default:
      return status
  }
}

export default async function BookingsPage() {
  const data = await getBookings()

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Nincs étterem beállítva</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Foglalások</h2>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Új foglalás
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Összes foglalás</CardTitle>
        </CardHeader>
        <CardContent>
          {data.bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Még nincs foglalás
            </p>
          ) : (
            <div className="space-y-3">
              {data.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-[120px]">
                      <div className="text-sm font-medium text-muted-foreground">
                        {formatDate(booking.bookingDate)}
                      </div>
                      <div className="text-lg font-bold">
                        {formatTime(booking.bookingDate)}
                      </div>
                    </div>
                    <div className="h-12 w-px bg-border" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {booking.guest.firstName} {booking.guest.lastName}
                        </p>
                        {booking.guest.vip && (
                          <Badge variant="secondary" className="text-xs">
                            VIP
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.table?.name || 'Nincs asztal'} • {booking.partySize} fő • {booking.duration} perc
                      </p>
                      {booking.specialRequests && (
                        <p className="text-xs text-muted-foreground mt-1">
                          💬 {booking.specialRequests}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(booking.status) as any}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
