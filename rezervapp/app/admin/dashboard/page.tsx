import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatTime, formatDate } from "@/lib/utils"
import { Calendar, Users, Utensils, TrendingUp } from "lucide-react"

async function getStats() {
  const restaurant = await prisma.restaurant.findFirst()

  if (!restaurant) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    todayBookings,
    totalBookings,
    totalGuests,
    totalTables,
  ] = await Promise.all([
    prisma.booking.findMany({
      where: {
        restaurantId: restaurant.id,
        bookingDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        guest: true,
        table: true,
      },
      orderBy: {
        bookingDate: 'asc',
      },
    }),
    prisma.booking.count({
      where: { restaurantId: restaurant.id },
    }),
    prisma.guest.count({
      where: { restaurantId: restaurant.id },
    }),
    prisma.table.count({
      where: { restaurantId: restaurant.id, isActive: true },
    }),
  ])

  return {
    restaurant,
    todayBookings,
    totalBookings,
    totalGuests,
    totalTables,
  }
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

export default async function DashboardPage() {
  const stats = await getStats()

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Nincs étterem beállítva</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            {formatDate(new Date())}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mai foglalások
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              Összes foglalás ma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Összes foglalás
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Összes időszak
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendégek
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
            <p className="text-xs text-muted-foreground">
              Regisztrált vendégek
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Asztalok
            </CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTables}</div>
            <p className="text-xs text-muted-foreground">
              Aktív asztalok
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Mai foglalások</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.todayBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nincs foglalás a mai napra
            </p>
          ) : (
            <div className="space-y-4">
              {stats.todayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {formatTime(booking.bookingDate)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {booking.duration} perc
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {booking.guest.firstName} {booking.guest.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.table?.name || 'Nincs asztal hozzárendelve'} • {booking.partySize} fő
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
