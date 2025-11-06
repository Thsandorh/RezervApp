import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsCharts } from "@/components/admin/analytics-charts"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import { hu } from "date-fns/locale"

async function getAnalyticsData() {
  const now = new Date()
  const startOfThisMonth = startOfMonth(now)
  const endOfThisMonth = endOfMonth(now)

  // Get bookings for the last 12 months
  const twelveMonthsAgo = subMonths(startOfThisMonth, 11)

  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: {
        gte: twelveMonthsAgo,
      },
    },
    include: {
      guest: true,
      table: true,
    },
    orderBy: {
      bookingDate: 'asc',
    },
  })

  // Calculate monthly statistics
  const monthlyStats = new Map<string, number>()
  const monthlyRevenue = new Map<string, number>() // Placeholder for future revenue tracking

  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(startOfThisMonth, i)
    const monthKey = format(monthDate, 'yyyy-MM')
    monthlyStats.set(monthKey, 0)
  }

  bookings.forEach((booking) => {
    const monthKey = format(booking.bookingDate, 'yyyy-MM')
    monthlyStats.set(monthKey, (monthlyStats.get(monthKey) || 0) + 1)
  })

  // Top guests by total bookings
  const guestStats = await prisma.guest.findMany({
    orderBy: {
      totalBookings: 'desc',
    },
    take: 10,
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      totalBookings: true,
      noShowCount: true,
    },
  })

  // Table utilization (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const recentBookings = await prisma.booking.findMany({
    where: {
      bookingDate: {
        gte: thirtyDaysAgo,
      },
      status: {
        in: ['CONFIRMED', 'SEATED', 'COMPLETED'],
      },
    },
    include: {
      table: true,
    },
  })

  const tableStats = new Map<string, { bookings: number; tableName: string }>()

  recentBookings.forEach((booking) => {
    if (booking.table) {
      const current = tableStats.get(booking.table.id) || {
        bookings: 0,
        tableName: booking.table.name,
      }
      tableStats.set(booking.table.id, {
        bookings: current.bookings + 1,
        tableName: booking.table.name,
      })
    }
  })

  // Status breakdown (last 30 days)
  const statusBreakdown = await prisma.booking.groupBy({
    by: ['status'],
    where: {
      bookingDate: {
        gte: thirtyDaysAgo,
      },
    },
    _count: {
      status: true,
    },
  })

  // This month statistics
  const thisMonthBookings = await prisma.booking.count({
    where: {
      bookingDate: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
    },
  })

  const thisMonthConfirmed = await prisma.booking.count({
    where: {
      bookingDate: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
      status: 'CONFIRMED',
    },
  })

  const thisMonthCancelled = await prisma.booking.count({
    where: {
      bookingDate: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
      status: 'CANCELLED',
    },
  })

  const thisMonthNoShow = await prisma.booking.count({
    where: {
      bookingDate: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
      status: 'NO_SHOW',
    },
  })

  return {
    monthlyStats: Array.from(monthlyStats.entries()).map(([month, count]) => ({
      month,
      count,
    })),
    topGuests: guestStats,
    tableUtilization: Array.from(tableStats.entries())
      .map(([tableId, data]) => ({
        tableId,
        tableName: data.tableName,
        bookings: data.bookings,
      }))
      .sort((a, b) => b.bookings - a.bookings),
    statusBreakdown,
    thisMonth: {
      total: thisMonthBookings,
      confirmed: thisMonthConfirmed,
      cancelled: thisMonthCancelled,
      noShow: thisMonthNoShow,
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics & Riportok</h1>
        <p className="text-muted-foreground">
          Foglalási statisztikák és elemzések
        </p>
      </div>

      {/* Current Month Summary */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ebben a hónapban
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.thisMonth.total}</div>
            <p className="text-xs text-muted-foreground">összes foglalás</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Megerősítve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.thisMonth.confirmed}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.thisMonth.total > 0
                ? Math.round((data.thisMonth.confirmed / data.thisMonth.total) * 100)
                : 0}
              % az összesből
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lemondva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.thisMonth.cancelled}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.thisMonth.total > 0
                ? Math.round((data.thisMonth.cancelled / data.thisMonth.total) * 100)
                : 0}
              % az összesből
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nem jelent meg
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.thisMonth.noShow}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.thisMonth.total > 0
                ? Math.round((data.thisMonth.noShow / data.thisMonth.total) * 100)
                : 0}
              % az összesből
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and detailed analytics */}
      <AnalyticsCharts
        monthlyStats={data.monthlyStats}
        topGuests={data.topGuests}
        tableUtilization={data.tableUtilization}
        statusBreakdown={data.statusBreakdown}
      />
    </div>
  )
}
