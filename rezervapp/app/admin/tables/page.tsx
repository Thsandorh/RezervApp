import { prisma } from "@/lib/prisma"
import { TablesView } from "@/components/admin/tables-view"

async function getTables() {
  const restaurant = await prisma.restaurant.findFirst()

  if (!restaurant) {
    return null
  }

  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

  const [tables, currentBookings] = await Promise.all([
    prisma.table.findMany({
      where: {
        restaurantId: restaurant.id,
      },
      orderBy: {
        name: 'asc',
      },
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
  ])

  // Calculate table statuses
  const tableStatuses = new Map<string, { status: 'free' | 'occupied' | 'soon'; nextBooking?: typeof currentBookings[0] }>()

  tables.forEach((table) => {
    tableStatuses.set(table.id, { status: 'free' })
  })

  currentBookings.forEach((booking) => {
    if (booking.table) {
      const bookingEnd = new Date(booking.bookingDate.getTime() + booking.duration * 60 * 1000)

      if (booking.bookingDate <= now && bookingEnd >= now) {
        // Currently occupied
        tableStatuses.set(booking.table.id, { status: 'occupied', nextBooking: booking })
      } else if (booking.bookingDate > now && booking.bookingDate <= oneHourFromNow) {
        // Occupied soon (within 1 hour)
        const current = tableStatuses.get(booking.table.id)
        if (current?.status === 'free') {
          tableStatuses.set(booking.table.id, { status: 'soon', nextBooking: booking })
        }
      }
    }
  })

  // Group tables by location
  const groupedTables = tables.reduce((acc, table) => {
    const location = table.location || 'Egyéb'
    if (!acc[location]) {
      acc[location] = []
    }
    acc[location].push(table)
    return acc
  }, {} as Record<string, typeof tables>)

  return { restaurant, tables, groupedTables, tableStatuses }
}

export default async function TablesPage() {
  const data = await getTables()

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Nincs étterem beállítva</p>
      </div>
    )
  }

  // Convert Map to plain object for client component
  const tableStatuses = Object.fromEntries(
    Array.from(data.tableStatuses.entries()).map(([id, status]) => [
      id,
      {
        status: status.status,
        nextBooking: status.nextBooking ? {
          ...status.nextBooking,
          bookingDate: status.nextBooking.bookingDate.toISOString(),
          createdAt: status.nextBooking.createdAt.toISOString(),
          updatedAt: status.nextBooking.updatedAt.toISOString(),
        } : undefined,
      },
    ])
  )

  return (
    <TablesView
      tables={data.tables}
      groupedTables={data.groupedTables}
      tableStatuses={tableStatuses}
    />
  )
}
