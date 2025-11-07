import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Phone, Mail, Clock } from "lucide-react"
import { SettingsForm } from "@/components/admin/settings-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

async function getRestaurant() {
  const restaurant = await prisma.restaurant.findFirst({
    include: {
      settings: true,
    },
  })
  return restaurant
}

function getOpeningHoursDisplay(openingHoursStr: string) {
  try {
    const hours = JSON.parse(openingHoursStr)
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap']

    return days.map((day, index) => ({
      day: dayNames[index],
      ...hours[day]
    }))
  } catch {
    return []
  }
}

export default async function SettingsPage() {
  const restaurant = await getRestaurant()

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Nincs étterem beállítva</p>
      </div>
    )
  }

  const openingHours = getOpeningHoursDisplay(restaurant.openingHours)

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Beállítások</h2>
        <p className="text-muted-foreground">
          Étterem információk és API kulcsok kezelése
        </p>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api-keys">API Kulcsok</TabsTrigger>
          <TabsTrigger value="restaurant">Étterem Info</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4">
          <SettingsForm
            restaurantId={restaurant.id}
            initialSettings={restaurant.settings || undefined}
          />
        </TabsContent>

        <TabsContent value="restaurant" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Restaurant Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Étterem információk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Név</p>
                  <p className="text-lg font-semibold">{restaurant.name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Slug (URL)</p>
                  <p className="font-mono text-sm">/book/{restaurant.slug}</p>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cím</p>
                    <p>{restaurant.address}</p>
                    <p>{restaurant.postalCode} {restaurant.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                    <p>{restaurant.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{restaurant.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Foglalási beállítások</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Időablak hossza</p>
                  <p className="text-lg font-semibold">{restaurant.slotDuration} perc</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Max előre foglalás</p>
                  <p className="text-lg font-semibold">{restaurant.maxAdvanceDays} nap</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Min előre foglalás</p>
                  <p className="text-lg font-semibold">{restaurant.minAdvanceHours} óra</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Időzóna</p>
                  <p className="text-lg font-semibold">{restaurant.timeZone}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pénznem</p>
                  <p className="text-lg font-semibold">{restaurant.currency}</p>
                </div>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Nyitvatartás
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {openingHours.map((dayHours: any, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <span className="font-medium">{dayHours.day}</span>
                      {dayHours.closed ? (
                        <Badge variant="secondary">Zárva</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {dayHours.open} - {dayHours.close}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
