"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Users, Clock, Loader2 } from "lucide-react"
import { format, addDays, setHours, setMinutes } from "date-fns"
import { hu } from "date-fns/locale"

const bookingSchema = z.object({
  firstName: z.string().min(2, "A keresztnév kötelező"),
  lastName: z.string().min(2, "A vezetéknév kötelező"),
  email: z.string().email("Érvénytelen email cím").optional().or(z.literal("")),
  phone: z.string().min(9, "Érvénytelen telefonszám"),
  date: z.string().min(1, "Válassz dátumot"),
  time: z.string().min(1, "Válassz időpontot"),
  partySize: z.string().min(1, "Add meg a létszámot"),
  specialRequests: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

interface BookingFormProps {
  restaurant: any
}

export function BookingForm({ restaurant }: BookingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedPartySize, setSelectedPartySize] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  const watchedDate = watch("date")
  const watchedPartySize = watch("partySize")

  // Load available time slots when date or party size changes
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!watchedDate || !watchedPartySize) {
        setAvailableSlots([])
        return
      }

      setIsLoadingSlots(true)
      try {
        const response = await fetch(
          `/api/availability?restaurantId=${restaurant.id}&date=${watchedDate}&partySize=${watchedPartySize}`
        )

        if (response.ok) {
          const data = await response.json()
          setAvailableSlots(data.availableSlots || [])
        } else {
          setAvailableSlots([])
        }
      } catch (error) {
        console.error("Failed to load available slots:", error)
        setAvailableSlots([])
      } finally {
        setIsLoadingSlots(false)
      }
    }

    loadAvailableSlots()
  }, [watchedDate, watchedPartySize, restaurant.id])

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          ...data,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Hiba történt a foglalás során")
      }

      const result = await response.json()
      router.push(`/book/${restaurant.slug}/success?bookingId=${result.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate available dates based on restaurant settings
  const maxDays = restaurant.maxAdvanceDays || 60
  const availableDates = Array.from({ length: maxDays }, (_, i) => {
    const date = addDays(new Date(), i)
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "yyyy. MMMM d. (EEEE)", { locale: hu }),
    }
  })

  const partySizes = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Dátum
          </Label>
          <select
            id="date"
            {...register("date")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Válassz dátumot</option>
            {availableDates.map((date) => (
              <option key={date.value} value={date.value}>
                {date.label}
              </option>
            ))}
          </select>
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Időpont
            {isLoadingSlots && <Loader2 className="h-3 w-3 animate-spin ml-2" />}
          </Label>
          <select
            id="time"
            {...register("time")}
            disabled={!watchedDate || !watchedPartySize || isLoadingSlots}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {!watchedDate || !watchedPartySize
                ? "Először válassz dátumot és létszámot"
                : isLoadingSlots
                ? "Elérhető időpontok betöltése..."
                : availableSlots.length === 0
                ? "Nincs elérhető időpont"
                : "Válassz időpontot"}
            </option>
            {availableSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {errors.time && (
            <p className="text-sm text-destructive">{errors.time.message}</p>
          )}
          {!isLoadingSlots && watchedDate && watchedPartySize && availableSlots.length === 0 && (
            <p className="text-sm text-amber-600">
              Ezen a napon nincs elérhető időpont erre a létszámra. Kérlek válassz másik dátumot!
            </p>
          )}
        </div>
      </div>

      {/* Party Size */}
      <div className="space-y-2">
        <Label htmlFor="partySize" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Létszám
        </Label>
        <select
          id="partySize"
          {...register("partySize")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Válassz létszámot</option>
          {partySizes.map((size) => (
            <option key={size} value={size.toString()}>
              {size} fő
            </option>
          ))}
        </select>
        {errors.partySize && (
          <p className="text-sm text-destructive">{errors.partySize.message}</p>
        )}
      </div>

      {/* Guest Details */}
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Kapcsolattartási adatok</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lastName">Vezetéknév *</Label>
            <Input
              id="lastName"
              {...register("lastName")}
              placeholder="Kovács"
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">Keresztnév *</Label>
            <Input
              id="firstName"
              {...register("firstName")}
              placeholder="János"
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefonszám *</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="+36301234567"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="kovacs.janos@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Special Requests */}
      <div className="space-y-2">
        <Label htmlFor="specialRequests">Különleges kérések (opcionális)</Label>
        <textarea
          id="specialRequests"
          {...register("specialRequests")}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="pl. allergia, születésnap, ablak melletti asztal, stb."
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Foglalás..." : "Foglalás megerősítése"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        A foglalás elküldésével elfogadod az adatkezelési szabályzatunkat
      </p>
    </form>
  )
}
