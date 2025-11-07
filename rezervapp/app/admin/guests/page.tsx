import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPhoneNumber } from "@/lib/utils"
import { Users, Star } from "lucide-react"

async function getGuests() {
  const restaurant = await prisma.restaurant.findFirst()

  if (!restaurant) {
    return null
  }

  const guests = await prisma.guest.findMany({
    where: {
      restaurantId: restaurant.id,
    },
    orderBy: {
      totalBookings: 'desc',
    },
  })

  return { restaurant, guests }
}

export default async function GuestsPage() {
  const data = await getGuests()

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Nincs étterem beállítva</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendégek</h2>
          <p className="text-muted-foreground">
            Összesen {data.guests.length} vendég
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendéglista</CardTitle>
        </CardHeader>
        <CardContent>
          {data.guests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Még nincs regisztrált vendég
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.guests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold">
                      {guest.firstName[0]}{guest.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </p>
                        {guest.vip && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            VIP
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatPhoneNumber(guest.phone)}</span>
                        {guest.email && <span>{guest.email}</span>}
                      </div>
                      {guest.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📝 {guest.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold">
                        {guest.totalBookings}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        foglalás
                      </div>
                    </div>
                    {guest.noShowCount > 0 && (
                      <div>
                        <div className="text-2xl font-bold text-destructive">
                          {guest.noShowCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          no-show
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
