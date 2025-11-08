import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Calendar, Users, Utensils, TrendingUp } from "lucide-react"
import { DashboardTables } from "@/components/admin/dashboard-tables"
import { TodayTimeline } from "@/components/admin/today-timeline"

async function getStats() {
  const restaurant = await prisma.restaurant.findFirst()

  if (!restaurant) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

  const [
    todayBookings,
    totalBookings,
    totalGuests,
    allTables,
    currentBookings,
    upcomingBookings,
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
    prisma.table.findMany({
      where: { restaurantId: restaurant.id, isActive: true },
    }),
    prisma.booking.findMany({
      where: {
        restaurantId: restaurant.id,
        bookingDate: {
          lte: oneHourFromNow,
        },
        status: {
          in: ['CONFIRMED', 'SEATED'],
        },
      },
      include: {
        table: true,
        guest: true,
      },
    }),
    prisma.booking.findMany({
      where: {
        restaurantId: restaurant.id,
        bookingDate: {
          gte: now,
        },
        status: {
          in: ['CONFIRMED', 'PENDING'],
        },
      },
      include: {
        guest: true,
      },
      orderBy: {
        bookingDate: 'asc',
      },
    }),
  ])

  // Calculate available tables
  const occupiedTableIds = new Set<string>()
  currentBookings.forEach((booking) => {
    if (booking.table) {
      const bookingEnd = new Date(booking.bookingDate.getTime() + booking.duration * 60 * 1000)
      if (booking.bookingDate <= now && bookingEnd >= now) {
        occupiedTableIds.add(booking.table.id)
      }
    }
  })

  const availableTables = allTables.filter((table) => !occupiedTableIds.has(table.id))

  return {
    restaurant,
    todayBookings,
    totalBookings,
    totalGuests,
    totalTables: allTables.length,
    availableTables: availableTables.length,
    allTables,
    occupiedTableIds,
    currentBookings,
    upcomingBookings,
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
    <div className="space-y-4">
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
              Szabad asztalok
            </CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.availableTables} / {stats.totalTables}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.availableTables > 0 ? 'Jelenleg elérhető' : 'Minden foglalt'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Asztalok elérhetősége (most) - Kattints az asztalra a részletekért</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardTables
            tables={stats.allTables}
            occupiedTableIds={stats.occupiedTableIds}
            currentBookings={stats.currentBookings.map((b) => ({
              id: b.id,
              bookingDate: b.bookingDate,
              duration: b.duration,
              partySize: b.partySize,
              specialRequests: b.specialRequests,
              tableId: b.tableId,
              guest: b.guest,
            }))}
            upcomingBookings={stats.upcomingBookings.map((b) => ({
              bookingDate: b.bookingDate,
              partySize: b.partySize,
              tableId: b.tableId,
              guest: b.guest,
            }))}
          />
        </CardContent>
      </Card>

      {/* Today's Bookings Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Mai foglalások - Időrend</CardTitle>
        </CardHeader>
        <CardContent>
          <TodayTimeline
            bookings={stats.todayBookings.map((b) => ({
              id: b.id,
              bookingDate: b.bookingDate,
              duration: b.duration,
              partySize: b.partySize,
              status: b.status,
              specialRequests: b.specialRequests,
              guest: b.guest,
              table: b.table,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
