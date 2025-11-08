"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookingsList } from "@/components/admin/bookings-list"
import { BookingsCalendar } from "@/components/admin/bookings-calendar"
import { TableMap } from "@/components/admin/table-map"
import { List, Calendar, LayoutGrid, Search } from "lucide-react"

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
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleUpdate = () => {
    router.refresh()
  }

  // Filter bookings based on search query
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings

    const query = searchQuery.toLowerCase()
    return bookings.filter((booking) => {
      const guestName = `${booking.guest.firstName} ${booking.guest.lastName}`.toLowerCase()
      const phone = booking.guest.phone.toLowerCase()
      const email = booking.guest.email?.toLowerCase() || ""
      const tableName = booking.table?.name.toLowerCase() || ""

      return (
        guestName.includes(query) ||
        phone.includes(query) ||
        email.includes(query) ||
        tableName.includes(query)
      )
    })
  }, [bookings, searchQuery])

  const getTitle = () => {
    switch (view) {
      case "list":
        return `Foglalások listája (${filteredBookings.length}${searchQuery ? ` / ${bookings.length}` : ""})`
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
        <div className="flex flex-col gap-4">
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

          {/* Search bar - only shown in list view */}
          {view === "list" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Keresés vendég név, telefonszám, email vagy asztal alapján..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {view === "list" && (
          <BookingsList bookings={filteredBookings} onUpdate={handleUpdate} />
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
