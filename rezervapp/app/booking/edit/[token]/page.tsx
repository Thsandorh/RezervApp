import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookingEditForm } from "@/components/public/booking-edit-form"
import { format } from "date-fns"
import { hu } from "date-fns/locale"

async function getBookingByToken(token: string) {
  const booking = await prisma.booking.findFirst({
    where: {
      cancelToken: token,
      status: {
        notIn: ["CANCELLED", "COMPLETED"],
      },
    },
    include: {
      guest: true,
      table: true,
      restaurant: true,
    },
  })

  return booking
}

interface PageProps {
  params: Promise<{
    token: string
  }>
}

export default async function BookingEditPage({ params }: PageProps) {
  const { token } = await params
  const booking = await getBookingByToken(token)

  if (!booking) {
    notFound()
  }

  // Convert dates to strings for serialization
  const serializedBooking = {
    ...booking,
    bookingDate: booking.bookingDate.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    restaurant: {
      ...booking.restaurant,
      createdAt: booking.restaurant.createdAt.toISOString(),
      updatedAt: booking.restaurant.updatedAt.toISOString(),
    },
    guest: {
      ...booking.guest,
      createdAt: booking.guest.createdAt.toISOString(),
      updatedAt: booking.guest.updatedAt.toISOString(),
    },
  }

  const formattedDate = format(booking.bookingDate, "yyyy. MMMM d. (EEEE)", { locale: hu })
  const formattedTime = format(booking.bookingDate, "HH:mm")

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Foglalás módosítása</h1>
          <p className="text-gray-600">
            {booking.restaurant.name}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Jelenlegi foglalás</CardTitle>
            <CardDescription>
              Módosíthatod az időpontot, létszámot vagy lemondhatod a foglalást
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Vendég neve:</span>
              <span className="font-semibold">
                {booking.guest.lastName} {booking.guest.firstName}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold">{booking.guest.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Telefon:</span>
              <span className="font-semibold">{booking.guest.phone}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Dátum:</span>
              <span className="font-semibold">{formattedDate}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Időpont:</span>
              <span className="font-semibold">{formattedTime}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Létszám:</span>
              <span className="font-semibold">{booking.partySize} fő</span>
            </div>
            {booking.table && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Asztal:</span>
                <span className="font-semibold">{booking.table.name}</span>
              </div>
            )}
            {booking.specialRequests && (
              <div className="flex justify-between items-start py-2 border-b">
                <span className="text-gray-600">Különleges kérések:</span>
                <span className="font-semibold text-right max-w-[250px]">
                  {booking.specialRequests}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Státusz:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                booking.status === "CONFIRMED"
                  ? "bg-green-100 text-green-800"
                  : booking.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {booking.status === "CONFIRMED" ? "Megerősítve" :
                 booking.status === "PENDING" ? "Függőben" : booking.status}
              </span>
            </div>
          </CardContent>
        </Card>

        <BookingEditForm
          booking={serializedBooking as any}
          token={token}
        />

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Ha bármilyen kérdésed van, hívj minket:</p>
          <p className="font-semibold">{booking.restaurant.phone}</p>
        </div>
      </div>
    </div>
  )
}
