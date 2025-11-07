"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookingForm } from "@/components/booking/booking-form"
import { MapPin, Phone, Mail, Clock, Languages } from "lucide-react"
import { translations, Language } from "@/lib/translations"

interface BookingPageClientProps {
  restaurant: any
  openingHours: string[]
}

export function BookingPageClient({ restaurant, openingHours }: BookingPageClientProps) {
  const [language, setLanguage] = useState<Language>("hu")
  const t = translations[language]

  const toggleLanguage = () => {
    setLanguage(language === "hu" ? "en" : "hu")
  }

  const dayNames = {
    hu: ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'],
    en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }

  const getOpeningHoursDisplay = () => {
    try {
      const hours = JSON.parse(restaurant.openingHours)
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

      return days.map((day, index) => {
        const dayHours = hours[day]
        if (dayHours?.closed) {
          return `${dayNames[language][index]}: ${t.closed}`
        }
        return `${dayNames[language][index]}: ${dayHours?.open || '--'} - ${dayHours?.close || '--'}`
      })
    } catch {
      return openingHours
    }
  }

  const displayHours = getOpeningHoursDisplay()

  const infoTexts = [
    `• ${t.infoConfirmationEmail}`,
    `• ${t.infoReminderSMS}`,
    `• ${t.infoArriveOnTime}`,
    `• ${t.infoCancellation}`
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Restaurant Header */}
        <div className="text-center mb-12">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2"
            >
              <Languages className="h-4 w-4" />
              {language === "hu" ? "English" : "Magyar"}
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {restaurant.name}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t.onlineBooking}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">{t.bookingDetails}</h2>
              <BookingForm restaurant={restaurant} language={language} />
            </Card>
          </div>

          {/* Restaurant Info */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">{t.contact}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p>{restaurant.address}</p>
                    <p>{restaurant.postalCode} {restaurant.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <p>{restaurant.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <p>{restaurant.email}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t.openingHours}
              </h3>
              <div className="space-y-2 text-sm">
                {displayHours.map((line, index) => (
                  <p key={index} className="text-muted-foreground">
                    {line}
                  </p>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-bold text-lg mb-2">
                {t.importantInfo}
              </h3>
              <ul className="text-sm space-y-2 text-muted-foreground">
                {infoTexts.map((text, index) => (
                  <li key={index}>{text}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
