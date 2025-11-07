"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookingsList } from "@/components/admin/bookings-list"
import { BookingsCalendar } from "@/components/admin/bookings-calendar"
import { TableMap } from "@/components/admin/table-map"
import { List, Calendar, LayoutGrid } from "lucide-react"

interface Guest {
  firstName: string
  lastName: string
  email: string | null
  phone: string
}

interface Table {
  id: string
  name: string
}

interface Booking {
  id: string
  bookingDate: string
  partySize: number
  duration: number
  status: string
  specialRequests: string | null
  internalNotes: string | null
  guest: Guest
  table: Table | null
}

interface TableInfo {
  id: string
  name: string
  capacity: number
  location: string | null
  isActive: boolean
}

interface BookingsViewProps {
  bookings: Booking[]
  tables: TableInfo[]
}

export function BookingsView({ bookings, tables }: BookingsViewProps) {
  const [view, setView] = useState<"list" | "calendar" | "map">("list")
  const router = useRouter()

  const handleUpdate = () => {
    router.refresh()
  }

  const getTitle = () => {
    switch (view) {
      case "list":
        return `Foglalások listája (${bookings.length})`
      case "calendar":
        return "Foglalások naptár"
      case "map":
        return "Asztal térkép"
      default:
        return "Foglalások"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg sm:text-2xl">{getTitle()}</CardTitle>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
            <Button
              variant={view === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("calendar")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Naptár
            </Button>
            <Button
              variant={view === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("map")}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Térkép
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === "list" && (
          <BookingsList bookings={bookings} onUpdate={handleUpdate} />
        )}
        {view === "calendar" && (
          <BookingsCalendar bookings={bookings} onUpdate={handleUpdate} />
        )}
        {view === "map" && (
          <TableMap tables={tables} bookings={bookings} />
        )}
      </CardContent>
    </Card>
  )
}
