"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { format, isWithinInterval } from "date-fns"
import { hu } from "date-fns/locale/hu"
import { TableInfoModal } from "./table-info-modal"

interface TableInfo {
  id: string
  name: string
  capacity: number
  location: string | null
  isActive: boolean
}

interface Table {
  id: string
  name: string
}

interface Guest {
  firstName: string
  lastName: string
  email: string | null
  phone: string
}

interface Booking {
  id: string
  bookingDate: string
  duration: number
  partySize: number
  status: string
  specialRequests: string | null
  table: Table | null
  guest: Guest
}

interface TableMapProps {
  tables: TableInfo[]
  bookings: Booking[]
}

type TableStatus = "free" | "occupied" | "soon" | "inactive"

export function TableMap({ tables, bookings }: TableMapProps) {
  const now = new Date()
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  const getTableStatus = (table: TableInfo): { status: TableStatus; nextBooking?: Booking } => {
    if (!table.isActive) {
      return { status: "inactive" }
    }

    // Find bookings for this table today
    const tableBookings = bookings.filter(
      (b) =>
        b.table?.name === table.name &&
        (b.status === "CONFIRMED" || b.status === "SEATED" || b.status === "PENDING")
    )

    // Check if occupied now
    for (const booking of tableBookings) {
      const bookingDate = new Date(booking.bookingDate)
      const bookingEnd = new Date(bookingDate.getTime() + booking.duration * 60000)

      // Table is occupied if:
      // 1. Guest has been seated (SEATED status) - regardless of time
      // 2. Booking is within the time window (for CONFIRMED bookings)
      if (booking.status === "SEATED" ||
          isWithinInterval(now, { start: bookingDate, end: bookingEnd })) {
        return { status: "occupied", nextBooking: booking }
      }
    }

    // Check if occupied soon (within 1 hour)
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    for (const booking of tableBookings) {
      const bookingDate = new Date(booking.bookingDate)

      if (bookingDate > now && bookingDate <= oneHourLater) {
        return { status: "soon", nextBooking: booking }
      }
    }

    return { status: "free" }
  }

  // Group tables by location
  const groupedTables = useMemo(() => {
    const grouped: Record<string, TableInfo[]> = {}
    tables.forEach((table) => {
      const location = table.location || "Egyéb"
      if (!grouped[location]) {
        grouped[location] = []
      }
      grouped[location].push(table)
    })
    return grouped
  }, [tables])

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case "free":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "soon":
        return "bg-yellow-500"
      case "inactive":
        return "bg-gray-300"
    }
  }

  const getStatusText = (status: TableStatus) => {
    switch (status) {
      case "free":
        return "Szabad"
      case "occupied":
        return "Foglalt"
      case "soon":
        return "Hamarosan"
      case "inactive":
        return "Inaktív"
    }
  }

  const getStatusBadgeVariant = (status: TableStatus): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "free":
        return "default"
      case "occupied":
        return "destructive"
      case "soon":
        return "secondary"
      case "inactive":
        return "secondary"
    }
  }

  // Calculate summary
  const summary = useMemo(() => {
    let free = 0
    let occupied = 0
    let soon = 0
    let inactive = 0

    tables.forEach((table) => {
      const { status } = getTableStatus(table)
      switch (status) {
        case "free":
          free++
          break
        case "occupied":
          occupied++
          break
        case "soon":
          soon++
          break
        case "inactive":
          inactive++
          break
      }
    })

    return { free, occupied, soon, inactive, total: tables.length }
  }, [tables, bookings])

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <div>
              <p className="text-2xl font-bold">{summary.free}</p>
              <p className="text-xs text-muted-foreground">Szabad</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <div>
              <p className="text-2xl font-bold">{summary.occupied}</p>
              <p className="text-xs text-muted-foreground">Foglalt</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <div>
              <p className="text-2xl font-bold">{summary.soon}</p>
              <p className="text-xs text-muted-foreground">Hamarosan</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
            <div>
              <p className="text-2xl font-bold">{summary.inactive}</p>
              <p className="text-xs text-muted-foreground">Inaktív</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table Grid by Location */}
      {Object.entries(groupedTables).map(([location, locationTables]) => (
        <div key={location}>
          <h3 className="text-lg font-semibold mb-4">{location}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {locationTables.map((table) => {
              const { status, nextBooking } = getTableStatus(table)
              return (
                <Card
                  key={table.id}
                  className="p-4 hover:shadow-lg transition-shadow relative overflow-hidden"
                >
                  {/* Status indicator bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${getStatusColor(status)}`}></div>

                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-lg">{table.name}</h4>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">
                      Max {table.capacity} fő
                    </p>

                    <Badge variant={getStatusBadgeVariant(status)} className="text-xs">
                      {getStatusText(status)}
                    </Badge>

                    {nextBooking && (
                      <div className="mt-3 pt-3 border-t text-xs">
                        <p className="font-medium text-muted-foreground">
                          {status === "occupied" ? "Jelenleg:" : "Következő:"}
                        </p>
                        <p className="font-semibold">
                          {format(new Date(nextBooking.bookingDate), "HH:mm", { locale: hu })}
                        </p>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTable(table.id)}
                      className="w-full mt-2 h-7 text-xs"
                    >
                      <Info className="h-3 w-3 mr-1" />
                      Info
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}

      {tables.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Még nincs asztal hozzáadva</p>
        </div>
      )}

      {/* Table Info Modal */}
      {selectedTable && (() => {
        const table = tables.find(t => t.id === selectedTable)
        if (!table) return null

        const { status, nextBooking } = getTableStatus(table)
        const isOccupied = status === "occupied"
        const currentBooking = isOccupied && nextBooking ? {
          id: nextBooking.id,
          bookingDate: new Date(nextBooking.bookingDate),
          duration: nextBooking.duration,
          partySize: nextBooking.partySize,
          specialRequests: nextBooking.specialRequests,
          guest: nextBooking.guest,
        } : undefined

        const upcomingBooking = !isOccupied && nextBooking ? {
          bookingDate: new Date(nextBooking.bookingDate),
          partySize: nextBooking.partySize,
          guest: {
            firstName: nextBooking.guest.firstName,
            lastName: nextBooking.guest.lastName,
          },
        } : undefined

        return (
          <TableInfoModal
            table={{
              id: table.id,
              name: table.name,
              capacity: table.capacity,
              location: table.location,
            }}
            isOccupied={isOccupied}
            currentBooking={currentBooking}
            nextBooking={upcomingBooking}
            open={true}
            onOpenChange={(open) => !open && setSelectedTable(null)}
          />
        )
      })()}
    </div>
  )
}
