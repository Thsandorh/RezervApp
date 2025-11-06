import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { BookingForm } from "@/components/booking/booking-form"
import { Card } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

async function getRestaurant(slug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      tables: {
        where: { isActive: true },
      },
    },
  })

  return restaurant
}

function getOpeningHoursDisplay(openingHoursStr: string) {
  try {
    const hours = JSON.parse(openingHoursStr)
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap']

    return days.map((day, index) => {
      const dayHours = hours[day]
      if (dayHours?.closed) {
        return `${dayNames[index]}: Zárva`
      }
      return `${dayNames[index]}: ${dayHours?.open || '--'} - ${dayHours?.close || '--'}`
    })
  } catch {
    return []
  }
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const restaurant = await getRestaurant(slug)

  if (!restaurant) {
    notFound()
  }

  const openingHours = getOpeningHoursDisplay(restaurant.openingHours)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Restaurant Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {restaurant.name}
          </h1>
          <p className="text-xl text-muted-foreground">
            Online foglalás
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Foglalás részletei</h2>
              <BookingForm restaurant={restaurant} />
            </Card>
          </div>

          {/* Restaurant Info */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Kapcsolat</h3>
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
                Nyitvatartás
              </h3>
              <div className="space-y-2 text-sm">
                {openingHours.map((line, index) => (
                  <p key={index} className="text-muted-foreground">
                    {line}
                  </p>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-bold text-lg mb-2">Tudnivalók</h3>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• A foglalás megerősítő emailt fogsz kapni</li>
                <li>• 24 órával a foglalás előtt SMS emlékeztetőt küldünk</li>
                <li>• Kérjük, pontosan érkezz!</li>
                <li>• Lemondás esetén használd az emailben kapott linket</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
