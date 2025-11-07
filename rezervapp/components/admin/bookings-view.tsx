"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookingsList } from "@/components/admin/bookings-list"
import { BookingsCalendar } from "@/components/admin/bookings-calendar"
import { List, Calendar } from "lucide-react"

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
  } | null
}

interface BookingsViewProps {
  bookings: Booking[]
}

export function BookingsView({ bookings }: BookingsViewProps) {
  const [view, setView] = useState<"list" | "calendar">("list")
  const router = useRouter()

  const handleUpdate = () => {
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {view === "list" ? "Foglalások listája" : "Foglalások naptár"} ({bookings.length})
          </CardTitle>

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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === "list" ? (
          <BookingsList bookings={bookings} onUpdate={handleUpdate} />
        ) : (
          <BookingsCalendar bookings={bookings} onUpdate={handleUpdate} />
        )}
      </CardContent>
    </Card>
  )
}
