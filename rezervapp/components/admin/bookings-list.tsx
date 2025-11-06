"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { BookingDetailsModal } from "@/components/modals/booking-details-modal"
import { Eye } from "lucide-react"

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
            {bookings.map((booking) => (
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

        {bookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Még nincs foglalás.
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
