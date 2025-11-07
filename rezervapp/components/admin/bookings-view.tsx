"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookingsList } from "@/components/admin/bookings-list"
import { BookingsCalendar } from "@/components/admin/bookings-calendar"
import { TableMap } from "@/components/admin/table-map"
import { List, Calendar, LayoutGrid } from "lucide-react"

interface Booking {
  id: string
  bookingDate: Date | string
  partySize: number
  duration: number
  status: string
  specialRequests?: string | null
  internalNotes?: string | null
  guest: {
    firstName: string
    lastName: string
    email?: string | null
    phone: string
  }
  table?: {
    name: string
    id?: string
  } | null
}

interface Table {
  id: string
  name: string
  capacity: number
  location: string | null
  isActive: boolean
}

interface BookingsViewProps {
  bookings: Booking[]
  tables?: Table[]
}

export function BookingsView({ bookings, tables = [] }: BookingsViewProps) {
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
          <CardTitle>{getTitle()}</CardTitle>

          <div className="flex gap-2">
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
        {view === "list" ? (
          <BookingsList bookings={bookings} onUpdate={handleUpdate} />
        ) : view === "calendar" ? (
          <BookingsCalendar bookings={bookings} onUpdate={handleUpdate} />
        ) : (
          <TableMap tables={tables} bookings={bookings} />
        )}
      </CardContent>
    </Card>
  )
}
