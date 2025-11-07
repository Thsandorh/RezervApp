"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Clock, Users, Utensils, Phone, Mail, MessageSquare, Trash2, Save } from "lucide-react"

interface BookingDetailsModalProps {
  booking: {
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
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Függőben", variant: "warning" },
  { value: "CONFIRMED", label: "Megerősítve", variant: "success" },
  { value: "SEATED", label: "Megérkezett", variant: "default" },
  { value: "COMPLETED", label: "Lezárva", variant: "secondary" },
  { value: "CANCELLED", label: "Lemondva", variant: "destructive" },
  { value: "NO_SHOW", label: "Nem jelent meg", variant: "destructive" },
]

export function BookingDetailsModal({ booking, isOpen, onClose, onUpdate }: BookingDetailsModalProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState(booking.status)
  const [internalNotes, setInternalNotes] = useState(booking.internalNotes || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          internalNotes: internalNotes || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Hiba történt")
      }

      toast({
        title: "Siker!",
        description: "Foglalás sikeresen frissítve!",
      })

      onUpdate()
      onClose()
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message || "Nem sikerült frissíteni a foglalást",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Biztosan törölni szeretnéd ezt a foglalást?")) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Hiba történt")
      }

      toast({
        title: "Siker!",
        description: "Foglalás sikeresen törölve!",
      })

      onUpdate()
      onClose()
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message || "Nem sikerült törölni a foglalást",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const currentStatus = STATUS_OPTIONS.find(s => s.value === status)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Foglalás részletei</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Guest Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Vendég információk</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Név</p>
                <p className="font-medium">
                  {booking.guest.lastName} {booking.guest.firstName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium">{booking.guest.phone}</p>
                </div>
              </div>
              {booking.guest.email && (
                <div className="flex items-center gap-2 col-span-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{booking.guest.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Foglalás adatok</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Dátum</p>
                  <p className="font-medium">
                    {format(new Date(booking.bookingDate), 'yyyy. MM. dd.')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Időpont</p>
                  <p className="font-medium">
                    {format(new Date(booking.bookingDate), 'HH:mm')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Létszám</p>
                  <p className="font-medium">{booking.partySize} fő</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Asztal</p>
                  <p className="font-medium">{booking.table?.name || "Nincs hozzárendelve"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Label>Különleges kérések</Label>
              </div>
              <p className="text-sm bg-gray-50 p-3 rounded-md">{booking.specialRequests}</p>
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label>Státusz</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Internal Notes */}
          <div className="space-y-2">
            <Label htmlFor="internalNotes">Belső jegyzetek (csak staff látja)</Label>
            <Textarea
              id="internalNotes"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Megjegyzések, allergiák, stb..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Törlés
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Mégse
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Mentés..." : "Mentés"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
