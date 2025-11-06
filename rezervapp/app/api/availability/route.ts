import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { addMinutes, parseISO, format, isAfter, isBefore } from "date-fns"

const availabilityRequestSchema = z.object({
  restaurantId: z.string(),
  date: z.string(), // YYYY-MM-DD
  partySize: z.number().min(1).max(50),
})

// Helper to check if a time slot is within opening hours
function isWithinOpeningHours(
  dateTime: Date,
  openingHours: any,
  slotDuration: number
): boolean {
  try {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[dateTime.getDay()]
    const dayHours = openingHours[dayName]

    if (!dayHours || dayHours.closed) {
      return false
    }

    const timeStr = format(dateTime, 'HH:mm')
    const [hours, minutes] = timeStr.split(':').map(Number)
    const slotMinutes = hours * 60 + minutes

    const slotEndTime = addMinutes(dateTime, slotDuration)
    const slotEndStr = format(slotEndTime, 'HH:mm')
    const [endHours, endMinutes] = slotEndStr.split(':').map(Number)
    const slotEndMinutes = endHours * 60 + endMinutes

    const [openHours, openMinutes] = dayHours.open.split(':').map(Number)
    const openMinutesTotal = openHours * 60 + openMinutes

    const [closeHours, closeMinutes] = dayHours.close.split(':').map(Number)
    const closeMinutesTotal = closeHours * 60 + closeMinutes

    return slotMinutes >= openMinutesTotal && slotEndMinutes <= closeMinutesTotal
  } catch (error) {
    console.error('Error checking opening hours:', error)
    return false
  }
}

// Helper to check if a table is available at a given time
async function isTableAvailable(
  tableId: string,
  startTime: Date,
  duration: number
): Promise<boolean> {
  const endTime = addMinutes(startTime, duration)

  // Find any conflicting bookings
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      tableId,
      status: {
        in: ['PENDING', 'CONFIRMED', 'SEATED'],
      },
      OR: [
        // Booking starts during our time slot
        {
          bookingDate: {
            gte: startTime,
            lt: endTime,
          },
        },
        // Booking ends during our time slot
        {
          AND: [
            {
              bookingDate: {
                lt: startTime,
              },
            },
          ],
        },
      ],
    },
  })

  // Also check if any booking overlaps by checking their end times
  for (const booking of conflictingBookings) {
    const bookingEnd = addMinutes(booking.bookingDate, booking.duration)

    // Check if there's any overlap
    if (
      (isAfter(startTime, booking.bookingDate) || startTime.getTime() === booking.bookingDate.getTime()) &&
      isBefore(startTime, bookingEnd)
    ) {
      return false
    }

    if (
      isAfter(endTime, booking.bookingDate) &&
      (isBefore(endTime, bookingEnd) || endTime.getTime() === bookingEnd.getTime())
    ) {
      return false
    }

    if (
      (isBefore(startTime, booking.bookingDate) || startTime.getTime() === booking.bookingDate.getTime()) &&
      (isAfter(endTime, bookingEnd) || endTime.getTime() === bookingEnd.getTime())
    ) {
      return false
    }
  }

  return true
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const date = searchParams.get('date')
    const partySizeStr = searchParams.get('partySize')

    if (!restaurantId || !date || !partySizeStr) {
      return NextResponse.json(
        { error: "Hiányzó paraméterek: restaurantId, date, partySize kötelező" },
        { status: 400 }
      )
    }

    const data = availabilityRequestSchema.parse({
      restaurantId,
      date,
      partySize: parseInt(partySizeStr),
    })

    // Get restaurant with settings
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
      include: {
        tables: {
          where: {
            isActive: true,
            capacity: {
              gte: data.partySize,
            },
          },
          orderBy: {
            capacity: 'asc',
          },
        },
      },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: "Étterem nem található" },
        { status: 404 }
      )
    }

    if (restaurant.tables.length === 0) {
      return NextResponse.json({
        availableSlots: [],
        message: "Nincs megfelelő asztal erre a létszámra",
      })
    }

    // Parse opening hours
    let openingHours: any = {}
    try {
      openingHours = JSON.parse(restaurant.openingHours)
    } catch {
      // If no opening hours set, use default
      openingHours = {
        monday: { open: '11:00', close: '22:00', closed: false },
        tuesday: { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday: { open: '11:00', close: '22:00', closed: false },
        friday: { open: '11:00', close: '22:00', closed: false },
        saturday: { open: '11:00', close: '22:00', closed: false },
        sunday: { open: '11:00', close: '22:00', closed: false },
      }
    }

    // Validate booking time constraints
    const now = new Date()
    const requestedDate = parseISO(data.date)
    const minBookingTime = addMinutes(now, restaurant.minAdvanceHours * 60)
    const maxBookingDate = new Date()
    maxBookingDate.setDate(maxBookingDate.getDate() + restaurant.maxAdvanceDays)

    // Generate time slots based on restaurant's slot duration
    const slots: { time: string; available: boolean }[] = []
    const slotDuration = restaurant.slotDuration

    // Generate slots from 00:00 to 23:30
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const slotDateTime = parseISO(`${data.date}T${timeStr}:00`)

        // Check if slot is in the past
        if (isBefore(slotDateTime, minBookingTime)) {
          continue
        }

        // Check if slot is too far in the future
        if (isAfter(slotDateTime, maxBookingDate)) {
          continue
        }

        // Check if within opening hours
        if (!isWithinOpeningHours(slotDateTime, openingHours, restaurant.slotDuration)) {
          continue
        }

        // Check if any table is available for this slot
        let hasAvailableTable = false
        for (const table of restaurant.tables) {
          const isAvailable = await isTableAvailable(
            table.id,
            slotDateTime,
            restaurant.slotDuration
          )
          if (isAvailable) {
            hasAvailableTable = true
            break
          }
        }

        slots.push({
          time: timeStr,
          available: hasAvailableTable,
        })
      }
    }

    return NextResponse.json({
      date: data.date,
      restaurantId: data.restaurantId,
      partySize: data.partySize,
      slotDuration: restaurant.slotDuration,
      availableSlots: slots.filter(slot => slot.available).map(slot => slot.time),
      allSlots: slots,
    })
  } catch (error) {
    console.error("Availability check error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Érvénytelen paraméterek", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Hiba történt az elérhetőség ellenőrzése során" },
      { status: 500 }
    )
  }
}
