"use client"

import { useState, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { BookingDetailsModal } from "@/components/modals/booking-details-modal"
import huLocale from "@fullcalendar/core/locales/hu"

interface Booking {
  id: string
  bookingDate: Date | string
  partySize: number
  status: string
  duration: number
  specialRequests?: string | null
  internalNotes?: string | null
  guest: {
    firstName: string
    lastName: string
    phone: string
    email?: string | null
    vip: boolean
  }
  table?: {
    name: string
    location?: string | null
  } | null
}

interface BookingsCalendarProps {
  initialBookings: Booking[]
}

function getEventColor(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "#22c55e" // green
    case "PENDING":
      return "#f59e0b" // orange
    case "SEATED":
      return "#3b82f6" // blue
    case "COMPLETED":
      return "#6b7280" // gray
    case "CANCELLED":
      return "#ef4444" // red
    case "NO_SHOW":
      return "#dc2626" // dark red
    default:
      return "#6b7280"
  }
}

export function BookingsCalendar({ initialBookings }: BookingsCalendarProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const events = initialBookings.map((booking) => {
    const start = new Date(booking.bookingDate)
    const end = new Date(start.getTime() + booking.duration * 60 * 1000)

    return {
      id: booking.id,
      title: `${booking.guest.firstName} ${booking.guest.lastName} (${booking.partySize} fő)`,
      start: start.toISOString(),
      end: end.toISOString(),
      backgroundColor: getEventColor(booking.status),
      borderColor: getEventColor(booking.status),
      extendedProps: {
        booking,
      },
    }
  })

  const handleEventClick = (info: any) => {
    const booking = info.event.extendedProps.booking
    setSelectedBooking(booking)
    setModalOpen(true)
  }

  return (
    <>
      <div className="bg-white p-4 rounded-lg">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={huLocale}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Ma",
            month: "Hónap",
            week: "Hét",
            day: "Nap",
          }}
          events={events}
          eventClick={handleEventClick}
          slotMinTime="09:00:00"
          slotMaxTime="24:00:00"
          allDaySlot={false}
          height="auto"
          nowIndicator={true}
          editable={false}
          selectable={true}
        />
      </div>

      <BookingDetailsModal
        booking={selectedBooking}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
