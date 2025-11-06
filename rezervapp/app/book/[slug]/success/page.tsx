import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Clock, Users, MapPin } from "lucide-react"
import Link from "next/link"
import { formatDate, formatTime } from "@/lib/utils"

async function getBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      restaurant: true,
      guest: true,
      table: true,
    },
  })

  return booking
}

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ bookingId?: string }>
}) {
  const { slug } = await params
  const { bookingId } = await searchParams

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Nincs foglalás azonosító</p>
      </div>
    )
  }

  const booking = await getBooking(bookingId)

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Nem található foglalás</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-green-200">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl text-green-700">
              Foglalás megerősítve!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              Foglalásod sikeresen rögzítettük. Hamarosan emailben kapsz visszaigazolást.
            </p>

            <div className="border-t border-b py-6 space-y-4">
              <h3 className="font-semibold text-lg">{booking.restaurant.name}</h3>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Dátum</p>
                    <p className="text-muted-foreground">
                      {formatDate(booking.bookingDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Időpont</p>
                    <p className="text-muted-foreground">
                      {formatTime(booking.bookingDate)} ({booking.duration} perc)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Létszám</p>
                    <p className="text-muted-foreground">
                      {booking.partySize} fő
                    </p>
                  </div>
                </div>

                {booking.table && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Asztal</p>
                      <p className="text-muted-foreground">
                        {booking.table.name}
                        {booking.table.location && ` - ${booking.table.location}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {booking.specialRequests && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Különleges kérések:</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.specialRequests}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Következő lépések:</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Email megerősítést külden a {booking.guest.email || booking.guest.phone} címre/számra</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>24 órával a foglalás előtt SMS emlékeztetőt kapsz</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>A lemondáshoz használd az emailben kapott linket</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link href={`/book/${booking.restaurant.slug}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Új foglalás
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full">
                  Vissza a főoldalra
                </Button>
              </Link>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Foglalás azonosító: {booking.id}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
