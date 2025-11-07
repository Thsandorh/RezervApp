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
import { hu } from "date-fns/locale/hu"
import { enUS } from "date-fns/locale/en-US"
import { translations, type Language } from "@/lib/translations"

const createBookingSchema = (lang: Language) => z.object({
  firstName: z.string().min(2, translations[lang].firstNameRequired),
  lastName: z.string().min(2, translations[lang].lastNameRequired),
  email: z.string().email(translations[lang].emailInvalid).optional().or(z.literal("")),
  phone: z.string().min(9, translations[lang].phoneInvalid),
  date: z.string().min(1, translations[lang].dateRequired),
  time: z.string().min(1, translations[lang].timeRequired),
  partySize: z.string().min(1, translations[lang].partySizeRequired),
  specialRequests: z.string().optional(),
})

type BookingFormData = z.infer<ReturnType<typeof createBookingSchema>>

interface BookingFormProps {
  restaurant: any
  language: Language
}

export function BookingForm({ restaurant, language }: BookingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedPartySize, setSelectedPartySize] = useState<string>("")

  const t = translations[language]
  const locale = language === "hu" ? hu : enUS

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(createBookingSchema(language)),
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
        throw new Error(errorData.error || t.bookingError)
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
      label: format(date, language === "hu" ? "yyyy. MMMM d. (EEEE)" : "EEEE, MMMM d, yyyy", { locale }),
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
            {t.date}
          </Label>
          <select
            id="date"
            {...register("date")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{t.selectDate}</option>
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
            {t.time}
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
                ? t.firstSelectDateTime
                : isLoadingSlots
                ? t.loadingSlots
                : availableSlots.length === 0
                ? t.noSlotsAvailable
                : t.selectTime}
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
              {t.noSlotsForDate}
            </p>
          )}
        </div>
      </div>

      {/* Party Size */}
      <div className="space-y-2">
        <Label htmlFor="partySize" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {t.partySize}
        </Label>
        <select
          id="partySize"
          {...register("partySize")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">{t.selectPartySize}</option>
          {partySizes.map((size) => (
            <option key={size} value={size.toString()}>
              {size} {t.people}
            </option>
          ))}
        </select>
        {errors.partySize && (
          <p className="text-sm text-destructive">{errors.partySize.message}</p>
        )}
      </div>

      {/* Guest Details */}
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">{t.contactDetails}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lastName">{t.lastName} {t.required}</Label>
            <Input
              id="lastName"
              {...register("lastName")}
              placeholder={t.lastNamePlaceholder}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">{t.firstName} {t.required}</Label>
            <Input
              id="firstName"
              {...register("firstName")}
              placeholder={t.firstNamePlaceholder}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone} {t.required}</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder={t.phonePlaceholder}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder={t.emailPlaceholder}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Special Requests */}
      <div className="space-y-2">
        <Label htmlFor="specialRequests">{t.specialRequestsOptional}</Label>
        <textarea
          id="specialRequests"
          {...register("specialRequests")}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={t.specialRequestsFormPlaceholder}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? t.booking : t.confirmBooking}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        {t.privacyNotice}
      </p>
    </form>
  )
}
