"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatTime } from "@/lib/utils"
import { Users, Clock, MessageSquare, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Guest {
  firstName: string
  lastName: string
  phone: string
  email: string | null
}

interface Table {
  id: string
  name: string
}

interface Booking {
  id: string
  bookingDate: Date
  duration: number
  partySize: number
  status: string
  specialRequests: string | null
  guest: Guest
  table: Table | null
}

interface TodayTimelineProps {
  bookings: Booking[]
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

export function TodayTimeline({ bookings }: TodayTimelineProps) {
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const now = new Date()

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Hiba történt a státusz frissítésekor")
      }

      toast.success(`Foglalás státusza frissítve: ${getStatusLabel(newStatus)}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating booking status:", error)
      toast.error("Hiba történt a művelet során")
    } finally {
      setUpdatingId(null)
    }
  }

  const isBookingActive = (booking: Booking) => {
    const bookingEnd = new Date(booking.bookingDate.getTime() + booking.duration * 60 * 1000)
    return booking.bookingDate <= now && bookingEnd >= now && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED'
  }

  const isBookingUpcoming = (booking: Booking) => {
    const timeDiff = booking.bookingDate.getTime() - now.getTime()
    const minutesDiff = Math.floor(timeDiff / 1000 / 60)
    return minutesDiff > 0 && minutesDiff <= 30 && booking.status === 'CONFIRMED'
  }

  if (bookings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nincs foglalás a mai napra
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking, index) => {
        const isActive = isBookingActive(booking)
        const isUpcoming = isBookingUpcoming(booking)
        const isUpdating = updatingId === booking.id

        return (
          <div key={booking.id} className="relative">
            {/* Timeline connector */}
            {index < bookings.length - 1 && (
              <div className="absolute left-[29px] top-12 bottom-0 w-0.5 bg-border" />
            )}

            <div className={`relative flex gap-4 p-4 border rounded-lg transition ${
              isActive ? 'bg-blue-50 border-blue-300 shadow-md' :
              isUpcoming ? 'bg-yellow-50 border-yellow-300' :
              'hover:bg-accent/50'
            }`}>
              {/* Timeline dot */}
              <div className={`flex-shrink-0 mt-1 w-3 h-3 rounded-full border-2 ${
                isActive ? 'bg-blue-500 border-blue-600 shadow-lg' :
                isUpcoming ? 'bg-yellow-500 border-yellow-600' :
                booking.status === 'COMPLETED' ? 'bg-green-500 border-green-600' :
                booking.status === 'CANCELLED' || booking.status === 'NO_SHOW' ? 'bg-red-500 border-red-600' :
                'bg-white border-border'
              }`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-center bg-white rounded border px-3 py-1 shadow-sm">
                      <div className="text-base font-bold">
                        {formatTime(booking.bookingDate)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {booking.duration} perc
                      </div>
                    </div>

                    {isActive && (
                      <Badge variant="default" className="bg-blue-600">
                        🔴 Most aktív
                      </Badge>
                    )}
                    {isUpcoming && (
                      <Badge variant="default" className="bg-yellow-600">
                        ⏰ Hamarosan
                      </Badge>
                    )}
                  </div>

                  <Badge variant={getStatusColor(booking.status) as any}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">
                      {booking.guest.firstName} {booking.guest.lastName}
                    </p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-xs text-muted-foreground">
                      {booking.guest.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {booking.partySize} fő
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {booking.table?.name || 'Nincs asztal'}
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="flex items-start gap-1 text-xs bg-white rounded border p-2">
                      <MessageSquare className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{booking.specialRequests}</span>
                    </div>
                  )}

                  {/* Quick actions */}
                  {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && booking.status !== 'NO_SHOW' && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {booking.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBookingStatus(booking.id, 'SEATED')}
                          disabled={isUpdating}
                          className="h-7 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Megérkezett
                        </Button>
                      )}
                      {booking.status === 'SEATED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                          disabled={isUpdating}
                          className="h-7 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Lezárás
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                        disabled={isUpdating}
                        className="h-7 text-xs text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Lemondás
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
