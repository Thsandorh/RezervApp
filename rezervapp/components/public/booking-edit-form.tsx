"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Calendar as CalendarIcon, Users, Trash2 } from "lucide-react"
import { format, addDays, setHours, setMinutes } from "date-fns"
import { hu } from "date-fns/locale"

interface BookingEditFormProps {
  booking: {
    id: string
    bookingDate: string
    partySize: number
    status: string
    restaurant: {
      id: string
      name: string
      minAdvanceHours: number
      maxAdvanceDays: number
      slotDuration: number
    }
  }
  token: string
}

export function BookingEditForm({ booking, token }: BookingEditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const bookingDate = new Date(booking.bookingDate)
  const [newDate, setNewDate] = useState(format(bookingDate, "yyyy-MM-dd"))
  const [newTime, setNewTime] = useState(format(bookingDate, "HH:mm"))
  const [newPartySize, setNewPartySize] = useState(booking.partySize.toString())

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Combine date and time
      const [hours, minutes] = newTime.split(":")
      let newDateTime = new Date(newDate)
      newDateTime = setHours(newDateTime, parseInt(hours))
      newDateTime = setMinutes(newDateTime, parseInt(minutes))

      // Check if date/time is in the future
      const now = new Date()
      const minAdvanceMs = booking.restaurant.minAdvanceHours * 60 * 60 * 1000
      const minDateTime = new Date(now.getTime() + minAdvanceMs)

      if (newDateTime < minDateTime) {
        toast({
          title: "Hibás időpont",
          description: `Minimum ${booking.restaurant.minAdvanceHours} órával előre kell foglalni.`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Check max advance days
      const maxDateTime = addDays(now, booking.restaurant.maxAdvanceDays)
      if (newDateTime > maxDateTime) {
        toast({
          title: "Hibás időpont",
          description: `Maximum ${booking.restaurant.maxAdvanceDays} nappal előre lehet foglalni.`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const response = await fetch(`/api/booking/edit/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingDate: newDateTime.toISOString(),
          partySize: parseInt(newPartySize),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Hiba történt a módosítás során")
      }

      toast({
        title: "Sikeres módosítás!",
        description: "A foglalásod módosítása megtörtént. Email értesítést küldtünk.",
      })

      // Refresh the page to show updated data
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message || "Nem sikerült módosítani a foglalást",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm("Biztosan lemondod a foglalást? Ez a művelet nem visszavonható.")) {
      return
    }

    setIsCancelling(true)

    try {
      const response = await fetch(`/api/booking/cancel/${token}`, {
        method: "POST",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Hiba történt a lemondás során")
      }

      toast({
        title: "Foglalás lemondva",
        description: "A foglalásod sikeresen lemondva. Email értesítést küldtünk.",
      })

      // Redirect to a thank you/confirmation page
      router.push(`/booking/cancelled`)
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message || "Nem sikerült lemondani a foglalást",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const hasChanges =
    newDate !== format(bookingDate, "yyyy-MM-dd") ||
    newTime !== format(bookingDate, "HH:mm") ||
    newPartySize !== booking.partySize.toString()

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Foglalás módosítása</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                <CalendarIcon className="inline h-4 w-4 mr-2" />
                Új dátum
              </Label>
              <Input
                id="date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                max={format(
                  addDays(new Date(), booking.restaurant.maxAdvanceDays),
                  "yyyy-MM-dd"
                )}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Új időpont</Label>
              <Input
                id="time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Minimum {booking.restaurant.minAdvanceHours} órával előre kell foglalni
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partySize">
                <Users className="inline h-4 w-4 mr-2" />
                Létszám
              </Label>
              <Input
                id="partySize"
                type="number"
                min="1"
                max="20"
                value={newPartySize}
                onChange={(e) => setNewPartySize(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !hasChanges}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Módosítás...
                </>
              ) : (
                "Módosítások mentése"
              )}
            </Button>

            {!hasChanges && (
              <p className="text-xs text-center text-gray-500">
                Végezz változtatásokat a mentéshez
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Foglalás lemondása</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Ha mégsem tudsz eljönni, lemondhatod a foglalást. Ez a művelet nem visszavonható.
          </p>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isCancelling || isLoading}
            className="w-full"
          >
            {isCancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lemondás...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Foglalás lemondása
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
