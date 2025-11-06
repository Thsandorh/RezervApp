"use client"

import { useState, useMemo } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { format } from "date-fns"
import { hu } from "date-fns/locale"
import { BookingDetailsModal } from "@/components/modals/booking-details-modal"

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

interface BookingsCalendarProps {
  bookings: Booking[]
  onUpdate: () => void
}

export function BookingsCalendar({ bookings, onUpdate }: BookingsCalendarProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Convert bookings to FullCalendar events
  const events = useMemo(() => {
    return bookings.map((booking) => {
      const bookingDate = new Date(booking.bookingDate)
      const endDate = new Date(bookingDate.getTime() + booking.duration * 60000)

      // Color based on status
      let backgroundColor = "#6b7280" // gray for default
      let borderColor = "#6b7280"

      switch (booking.status) {
        case "CONFIRMED":
          backgroundColor = "#10b981" // green
          borderColor = "#059669"
          break
        case "PENDING":
          backgroundColor = "#f59e0b" // yellow/amber
          borderColor = "#d97706"
          break
        case "SEATED":
          backgroundColor = "#3b82f6" // blue
          borderColor = "#2563eb"
          break
        case "COMPLETED":
          backgroundColor = "#6b7280" // gray
          borderColor = "#4b5563"
          break
        case "CANCELLED":
          backgroundColor = "#ef4444" // red
          borderColor = "#dc2626"
          break
        case "NO_SHOW":
          backgroundColor = "#ef4444" // red
          borderColor = "#dc2626"
          break
      }

      return {
        id: booking.id,
        title: `${booking.guest.lastName} ${booking.guest.firstName} (${booking.partySize} fő)`,
        start: bookingDate.toISOString(),
        end: endDate.toISOString(),
        backgroundColor,
        borderColor,
        extendedProps: {
          booking,
        },
      }
    })
  }, [bookings])

  const handleEventClick = (info: any) => {
    const booking = info.event.extendedProps.booking
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
      <div className="bg-white rounded-lg p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          locale="hu"
          slotMinTime="08:00:00"
          slotMaxTime="23:00:00"
          allDaySlot={false}
          weekends={true}
          nowIndicator={true}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#10b981" }}></div>
          <span>Megerősítve</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f59e0b" }}></div>
          <span>Függőben</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#3b82f6" }}></div>
          <span>Megérkezett</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#6b7280" }}></div>
          <span>Lezárva</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }}></div>
          <span>Lemondva / Nem jelent meg</span>
        </div>
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
