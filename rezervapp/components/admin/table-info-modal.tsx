"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, MapPin, MessageSquare, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface TableInfoModalProps {
  table: {
    id: string
    name: string
    capacity: number
    location: string | null
  }
  isOccupied: boolean
  currentBooking?: {
    id: string
    bookingDate: Date
    duration: number
    partySize: number
    specialRequests: string | null
    guest: {
      firstName: string
      lastName: string
      phone: string
      email: string | null
    }
  }
  nextBooking?: {
    bookingDate: Date
    partySize: number
    guest: {
      firstName: string
      lastName: string
    }
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TableInfoModal({
  table,
  isOccupied,
  currentBooking,
  nextBooking,
  open,
  onOpenChange,
  onSuccess,
}: TableInfoModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClearTable = async () => {
    if (!currentBooking) return

    if (!confirm(`Biztosan lezárod a foglalást és felszabadítod az asztalt?\n\nVendég: ${currentBooking.guest.firstName} ${currentBooking.guest.lastName}`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/bookings/${currentBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      })

      if (!response.ok) {
        throw new Error("Hiba történt a foglalás lezárásakor")
      }

      toast.success("Asztal sikeresen felszabadítva!")
      onOpenChange(false)

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error clearing table:", error)
      toast.error("Hiba történt a művelet során")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('hu-HU', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('hu-HU', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    })
  }

  const getEndTime = (start: Date, duration: number) => {
    const end = new Date(new Date(start).getTime() + duration * 60 * 1000)
    return formatTime(end)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{table.name}</DialogTitle>
            <Badge variant={isOccupied ? "destructive" : "default"}>
              {isOccupied ? "🔴 Foglalt" : "🟢 Szabad"}
            </Badge>
          </div>
          <DialogDescription>
            Asztal részletek és foglalási információk
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Table Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Kapacitás</p>
                <p className="font-semibold">{table.capacity} fő</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Helyszín</p>
                <p className="font-semibold">{table.location || "Nincs megadva"}</p>
              </div>
            </div>
          </div>

          {/* Current Booking (if occupied) */}
          {isOccupied && currentBooking && (
            <div className="border rounded-lg p-4 bg-red-50 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Jelenlegi foglalás
              </h3>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Vendég</p>
                  <p className="font-semibold">
                    {currentBooking.guest.firstName} {currentBooking.guest.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentBooking.guest.phone}
                    {currentBooking.guest.email && ` • ${currentBooking.guest.email}`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Időpont</p>
                    <p className="font-semibold">
                      {formatTime(currentBooking.bookingDate)} - {getEndTime(currentBooking.bookingDate, currentBooking.duration)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Létszám</p>
                    <p className="font-semibold">{currentBooking.partySize} fő</p>
                  </div>
                </div>

                {currentBooking.specialRequests && (
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Különleges kérések
                    </p>
                    <p className="text-sm mt-1 p-2 bg-white rounded border">
                      {currentBooking.specialRequests}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Booking (if free) */}
          {!isOccupied && nextBooking && (
            <div className="border rounded-lg p-4 bg-blue-50 space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Következő foglalás
              </h3>

              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-semibold">
                    {nextBooking.guest.firstName} {nextBooking.guest.lastName}
                  </span>
                  {" • "}
                  {nextBooking.partySize} fő
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(nextBooking.bookingDate)} • {formatTime(nextBooking.bookingDate)}
                </p>
              </div>
            </div>
          )}

          {/* No upcoming bookings */}
          {!isOccupied && !nextBooking && (
            <div className="border rounded-lg p-4 bg-green-50 text-center">
              <p className="text-sm text-muted-foreground">
                ✅ Nincs közelgő foglalás erre az asztalra
              </p>
            </div>
          )}
        </div>

        {/* Footer with Clear Table button */}
        {isOccupied && currentBooking && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClearTable}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {loading ? "Felszabadítás..." : "Asztal felszabadítása"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
