"use client"

import { useState } from "react"
import { TableInfoModal } from "./table-info-modal"

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

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {tables.map((table) => {
          const isOccupied = occupiedTableIds.has(table.id)
          return (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table.id)}
              className={`p-3 rounded-lg border-2 transition hover:scale-105 hover:shadow-md ${
                isOccupied
                  ? 'border-red-500 bg-red-50 hover:bg-red-100'
                  : 'border-green-500 bg-green-50 hover:bg-green-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{table.name}</span>
                <span className={`text-xs font-bold ${isOccupied ? 'text-red-600' : 'text-green-600'}`}>
                  {isOccupied ? '🔴' : '🟢'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {table.capacity} fő • {table.location || 'Egyéb'}
              </div>
            </button>
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
