"use client"

import { useState, useMemo } from "react"
import { format, startOfDay, endOfDay, addDays, isWithinInterval } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookingDetailsModal } from "@/components/modals/booking-details-modal"
import { Eye, Search, Calendar, Filter } from "lucide-react"

interface Booking {
  id: string
  bookingDate: Date | string
  partySize: number
  duration: number
  status: string
  specialRequests?: string | null
  internalNotes?: string | null
  guest: {
    firstName: string
    lastName: string
    email?: string | null
    phone: string
  }
  table?: {
    name: string
  } | null
}

interface BookingsListProps {
  bookings: Booking[]
  onUpdate: () => void
}

export function BookingsList({ bookings: initialBookings, onUpdate }: BookingsListProps) {
  const [bookings, setBookings] = useState(initialBookings)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Apply filters
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Search filter (name, phone)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const fullName = `${booking.guest.firstName} ${booking.guest.lastName}`.toLowerCase()
        const phone = booking.guest.phone.toLowerCase()

        if (!fullName.includes(query) && !phone.includes(query)) {
          return false
        }
      }

      // Date filter
      if (dateFilter !== "all") {
        const bookingDate = new Date(booking.bookingDate)
        const today = startOfDay(new Date())

        switch (dateFilter) {
          case "today":
            if (!isWithinInterval(bookingDate, { start: today, end: endOfDay(today) })) {
              return false
            }
            break
          case "tomorrow":
            const tomorrow = addDays(today, 1)
            if (!isWithinInterval(bookingDate, { start: tomorrow, end: endOfDay(tomorrow) })) {
              return false
            }
            break
          case "next7days":
            const next7Days = addDays(today, 7)
            if (!isWithinInterval(bookingDate, { start: today, end: next7Days })) {
              return false
            }
            break
          case "past":
            if (bookingDate >= today) {
              return false
            }
            break
        }
      }

      // Status filter
      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false
      }

      return true
    })
  }, [bookings, searchQuery, dateFilter, statusFilter])

  const handleOpenModal = (booking: Booking) => {
    // Convert string dates to Date objects
    const bookingWithDate = {
      ...booking,
      bookingDate: typeof booking.bookingDate === 'string'
        ? new Date(booking.bookingDate)
        : booking.bookingDate
    }
    setSelectedBooking(bookingWithDate)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBooking(null)
  }

  const handleUpdate = () => {
    onUpdate()
    handleCloseModal()
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Keresés név vagy telefon alapján..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Dátum szűrő" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Összes dátum</SelectItem>
              <SelectItem value="today">Ma</SelectItem>
              <SelectItem value="tomorrow">Holnap</SelectItem>
              <SelectItem value="next7days">Következő 7 nap</SelectItem>
              <SelectItem value="past">Elmúlt foglalások</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Státusz szűrő" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Összes státusz</SelectItem>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
              <SelectItem value="SEATED">SEATED</SelectItem>
              <SelectItem value="COMPLETED">COMPLETED</SelectItem>
              <SelectItem value="CANCELLED">CANCELLED</SelectItem>
              <SelectItem value="NO_SHOW">NO_SHOW</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          {filteredBookings.length === bookings.length ? (
            <span>Összesen: <strong>{bookings.length}</strong> foglalás</span>
          ) : (
            <span>
              Megjelenítve: <strong>{filteredBookings.length}</strong> / {bookings.length} foglalás
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Dátum</th>
              <th className="text-left p-2">Időpont</th>
              <th className="text-left p-2">Vendég</th>
              <th className="text-left p-2">Telefon</th>
              <th className="text-left p-2">Létszám</th>
              <th className="text-left p-2">Asztal</th>
              <th className="text-left p-2">Státusz</th>
              <th className="text-left p-2">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  {format(new Date(booking.bookingDate), 'yyyy. MM. dd.')}
                </td>
                <td className="p-2">
                  {format(new Date(booking.bookingDate), 'HH:mm')}
                </td>
                <td className="p-2">
                  {booking.guest.lastName} {booking.guest.firstName}
                </td>
                <td className="p-2 text-sm text-gray-600">
                  {booking.guest.phone}
                </td>
                <td className="p-2">{booking.partySize} fő</td>
                <td className="p-2">
                  {booking.table?.name || 'Nincs hozzárendelve'}
                </td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : booking.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(booking)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Részletek
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {bookings.length === 0 ? (
              <p>Még nincs foglalás.</p>
            ) : (
              <p>Nincs találat a megadott szűrőkkel. Próbálj más keresési feltételeket!</p>
            )}
          </div>
        )}
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
      )}
    </>
  )
}
