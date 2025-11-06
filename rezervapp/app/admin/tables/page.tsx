import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Utensils } from "lucide-react"

async function getTables() {
  const restaurant = await prisma.restaurant.findFirst()

  if (!restaurant) {
    return null
  }

  const tables = await prisma.table.findMany({
    where: {
      restaurantId: restaurant.id,
    },
    orderBy: {
      name: 'asc',
    },
  })

  // Group tables by location
  const groupedTables = tables.reduce((acc, table) => {
    const location = table.location || 'Egyéb'
    if (!acc[location]) {
      acc[location] = []
    }
    acc[location].push(table)
    return acc
  }, {} as Record<string, typeof tables>)

  return { restaurant, tables, groupedTables }
}

export default async function TablesPage() {
  const data = await getTables()

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
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Asztalok</h2>
          <p className="text-muted-foreground">
            Összesen {data.tables.length} asztal
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Új asztal
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(data.groupedTables).map(([location, tables]) => (
          <Card key={location}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                {location}
                <Badge variant="secondary" className="ml-2">
                  {tables.length} asztal
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{table.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Max {table.capacity} fő
                        </p>
                      </div>
                      <Badge
                        variant={table.isActive ? 'success' : 'secondary'}
                      >
                        {table.isActive ? 'Aktív' : 'Inaktív'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.tables.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Még nincs asztal hozzáadva
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Első asztal hozzáadása
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
