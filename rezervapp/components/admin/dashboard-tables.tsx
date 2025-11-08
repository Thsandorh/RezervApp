"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { TableInfoModal } from "./table-info-modal"
import { Button } from "@/components/ui/button"

interface DashboardTablesProps {
  tables: Array<{
    id: string
    name: string
    capacity: number
    location: string | null
  }>
  occupiedTableIds: Set<string>
  currentBookings: Array<{
    id: string
    bookingDate: Date
    duration: number
    partySize: number
    specialRequests: string | null
    tableId: string | null
    guest: {
      firstName: string
      lastName: string
      phone: string
      email: string | null
    }
  }>
  upcomingBookings: Array<{
    bookingDate: Date
    partySize: number
    tableId: string | null
    guest: {
      firstName: string
      lastName: string
    }
  }>
}

export function DashboardTables({
  tables,
  occupiedTableIds,
  currentBookings,
  upcomingBookings,
}: DashboardTablesProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  const selectedTableData = tables.find((t) => t.id === selectedTable)
  const isOccupied = selectedTable ? occupiedTableIds.has(selectedTable) : false
  const currentBooking = currentBookings.find((b) => b.tableId === selectedTable)
  const nextBooking = upcomingBookings.find((b) => b.tableId === selectedTable)

  const handleTableClick = (tableId: string) => {
    setSelectedTable(tableId)
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {tables.map((table) => {
          const isOccupied = occupiedTableIds.has(table.id)
          return (
            <div
              key={table.id}
              className={`relative p-3 rounded-lg border-2 transition ${
                isOccupied
                  ? 'border-red-500 bg-red-50'
                  : 'border-green-500 bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{table.name}</span>
                <span className={`text-xs font-bold ${isOccupied ? 'text-red-600' : 'text-green-600'}`}>
                  {isOccupied ? '🔴' : '🟢'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {table.capacity} fő • {table.location || 'Egyéb'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTableClick(table.id)}
                className="w-full h-7 text-xs hover:bg-black/5"
              >
                <Info className="h-3 w-3 mr-1" />
                Info
              </Button>
            </div>
          )
        })}
      </div>

      {tables.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nincsenek aktív asztalok
        </p>
      )}

      {selectedTableData && (
        <TableInfoModal
          table={selectedTableData}
          isOccupied={isOccupied}
          currentBooking={currentBooking}
          nextBooking={nextBooking}
          open={!!selectedTable}
          onOpenChange={(open) => !open && setSelectedTable(null)}
        />
      )}
    </>
  )
}
