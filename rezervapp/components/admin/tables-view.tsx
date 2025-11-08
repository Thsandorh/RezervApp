"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Utensils, Info } from "lucide-react"
import { AddTableModal } from "@/components/modals/add-table-modal"
import { TableInfoModal } from "./table-info-modal"
import { useRouter } from "next/navigation"
import { formatTime } from "@/lib/utils"

interface Table {
  id: string
  name: string
  capacity: number
  location: string | null
  isActive: boolean
}

interface Guest {
  firstName: string
  lastName: string
  email: string | null
  phone: string
}

interface Booking {
  id: string
  bookingDate: string
  duration: number
  partySize: number
  status: string
  specialRequests: string | null
  table: Table | null
  guest: Guest
}

interface TableStatus {
  status: 'free' | 'occupied' | 'soon'
  nextBooking?: Booking
}

interface TablesViewProps {
  tables: Table[]
  groupedTables: Record<string, Table[]>
  tableStatuses: Record<string, TableStatus>
}

export function TablesView({ tables, groupedTables, tableStatuses }: TablesViewProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const router = useRouter()

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Asztalok</h2>
            <p className="text-muted-foreground">
              Összesen {tables.length} asztal
            </p>
          </div>
          <Button className="gap-2" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Új asztal
          </Button>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedTables).map(([location, locationTables]) => (
            <Card key={location}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  {location}
                  <Badge variant="secondary" className="ml-2">
                    {locationTables.length} asztal
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {locationTables.map((table) => {
                    const status = tableStatuses[table.id]
                    const statusInfo = status?.status || 'free'

                    return (
                      <div
                        key={table.id}
                        className={`border-2 rounded-lg p-4 transition ${
                          !table.isActive
                            ? 'border-gray-300 bg-gray-50'
                            : statusInfo === 'occupied'
                            ? 'border-red-500 bg-red-50'
                            : statusInfo === 'soon'
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-green-500 bg-green-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{table.name}</h3>
                              <span className="text-lg">
                                {!table.isActive
                                  ? '⚪'
                                  : statusInfo === 'occupied'
                                  ? '🔴'
                                  : statusInfo === 'soon'
                                  ? '🟡'
                                  : '🟢'}
                              </span>
                            </div>
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

                        {table.isActive && status?.nextBooking && (
                          <div className="mt-2 pt-2 border-t text-xs">
                            <p className="font-medium">
                              {statusInfo === 'occupied' ? 'Most foglalt:' : 'Hamarosan:'}
                            </p>
                            <p className="text-muted-foreground">
                              {formatTime(new Date(status.nextBooking.bookingDate))} • {status.nextBooking.guest.firstName} {status.nextBooking.guest.lastName}
                            </p>
                            <p className="text-muted-foreground">
                              {status.nextBooking.partySize} fő • {status.nextBooking.duration} perc
                            </p>
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTable(table.id)}
                          className="w-full mt-2 h-7 text-xs hover:bg-black/5"
                        >
                          <Info className="h-3 w-3 mr-1" />
                          Info
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tables.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Még nincs asztal hozzáadva
              </p>
              <Button onClick={() => setAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Első asztal hozzáadása
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AddTableModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={handleSuccess}
      />

      {selectedTable && (() => {
        const table = tables.find(t => t.id === selectedTable)
        if (!table) return null

        const status = tableStatuses[selectedTable]
        const isOccupied = status?.status === 'occupied'

        // Transform the booking data for the modal
        const currentBooking = isOccupied && status?.nextBooking ? {
          ...status.nextBooking,
          bookingDate: new Date(status.nextBooking.bookingDate),
          table: table,
        } : undefined

        const upcomingBooking = !isOccupied && status?.nextBooking ? {
          ...status.nextBooking,
          bookingDate: new Date(status.nextBooking.bookingDate),
          table: table,
        } : undefined

        return (
          <TableInfoModal
            table={table}
            isOccupied={isOccupied}
            currentBooking={currentBooking}
            nextBooking={upcomingBooking}
            open={true}
            onOpenChange={(open) => {
              if (!open) setSelectedTable(null)
            }}
            onSuccess={handleSuccess}
          />
        )
      })()}
    </>
  )
}
