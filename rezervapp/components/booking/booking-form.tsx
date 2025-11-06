"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Users, Clock } from "lucide-react"
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

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

  // Generate available dates (next 60 days)
  const availableDates = Array.from({ length: 60 }, (_, i) => {
    const date = addDays(new Date(), i)
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "yyyy. MMMM d. (EEEE)", { locale: hu }),
    }
  })

  // Generate time slots (11:00 - 22:00, every 30 minutes)
  const timeSlots = []
  for (let hour = 11; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 22 && minute > 0) break
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      timeSlots.push(time)
    }
  }

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
          </Label>
          <select
            id="time"
            {...register("time")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Válassz időpontot</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {errors.time && (
            <p className="text-sm text-destructive">{errors.time.message}</p>
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
