"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Table2, PieChart } from "lucide-react"
import { format } from "date-fns"
import { hu } from "date-fns/locale/hu"

interface AnalyticsChartsProps {
  monthlyStats: Array<{ month: string; count: number }>
  topGuests: Array<{
    firstName: string
    lastName: string
    email: string | null
    phone: string
    totalBookings: number
    noShowCount: number
  }>
  tableUtilization: Array<{
    tableId: string
    tableName: string
    bookings: number
  }>
  statusBreakdown: Array<{
    status: string
    _count: { status: number }
  }>
}

export function AnalyticsCharts({
  monthlyStats,
  topGuests,
  tableUtilization,
  statusBreakdown,
}: AnalyticsChartsProps) {
  // Calculate max value for chart scaling
  const maxBookings = Math.max(...monthlyStats.map((s) => s.count), 1)
  const maxTableBookings = Math.max(...tableUtilization.map((t) => t.bookings), 1)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Monthly Bookings Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Foglalások az elmúlt 12 hónapban
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {monthlyStats.map((stat) => {
              const percentage = (stat.count / maxBookings) * 100
              const [year, month] = stat.month.split('-')
              const monthName = format(new Date(parseInt(year), parseInt(month) - 1), 'MMM yyyy', {
                locale: hu,
              })

              return (
                <div key={stat.month} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-gray-600">{monthName}</div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-sm font-semibold">{stat.count}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Guests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top 10 vendég
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topGuests.map((guest, index) => (
              <div
                key={guest.phone}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {guest.lastName} {guest.firstName}
                    </div>
                    <div className="text-xs text-gray-500">{guest.phone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">{guest.totalBookings}</div>
                  <div className="text-xs text-gray-500">foglalás</div>
                  {guest.noShowCount > 0 && (
                    <div className="text-xs text-red-600">{guest.noShowCount} no-show</div>
                  )}
                </div>
              </div>
            ))}
            {topGuests.length === 0 && (
              <p className="text-center text-gray-500 py-4">Még nincs vendég</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table2 className="h-5 w-5" />
            Asztal kihasználtság (30 nap)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tableUtilization.map((table) => {
              const percentage = (table.bookings / maxTableBookings) * 100

              return (
                <div key={table.tableId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{table.tableName}</span>
                    <span className="text-gray-600">{table.bookings} foglalás</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {tableUtilization.length === 0 && (
              <p className="text-center text-gray-500 py-4">Nincs adat</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Státusz megoszlás (30 nap)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusBreakdown.map((status) => {
              const statusLabels: Record<string, string> = {
                PENDING: 'Függőben',
                CONFIRMED: 'Megerősítve',
                SEATED: 'Megérkezett',
                COMPLETED: 'Lezárva',
                CANCELLED: 'Lemondva',
                NO_SHOW: 'Nem jelent meg',
              }

              const statusColors: Record<string, string> = {
                PENDING: 'bg-yellow-100 text-yellow-800',
                CONFIRMED: 'bg-green-100 text-green-800',
                SEATED: 'bg-blue-100 text-blue-800',
                COMPLETED: 'bg-gray-100 text-gray-800',
                CANCELLED: 'bg-red-100 text-red-800',
                NO_SHOW: 'bg-orange-100 text-orange-800',
              }

              return (
                <div
                  key={status.status}
                  className={`p-4 rounded-lg ${statusColors[status.status] || 'bg-gray-100'}`}
                >
                  <div className="text-2xl font-bold">{status._count.status}</div>
                  <div className="text-sm font-medium">
                    {statusLabels[status.status] || status.status}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
