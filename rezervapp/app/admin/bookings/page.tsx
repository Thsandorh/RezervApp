import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BookingsList } from "./bookings-list"
import { BookingsCalendar } from "@/components/admin/bookings-calendar"

async function getBookings() {
  const restaurant = await prisma.restaurant.findFirst()

  if (!restaurant) {
    return null
  }

  const bookings = await prisma.booking.findMany({
    where: {
      restaurantId: restaurant.id,
    },
    include: {
      guest: true,
      table: true,
    },
    orderBy: {
      bookingDate: 'desc',
    },
    take: 100,
  })

  return { restaurant, bookings }
}

export default async function BookingsPage() {
  const data = await getBookings()

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Nincs étterem beállítva</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Foglalások</h2>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Új foglalás
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Naptár</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Összes foglalás ({data.bookings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingsList bookings={data.bookings as any} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Naptár nézet</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingsCalendar bookings={data.bookings as any} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
