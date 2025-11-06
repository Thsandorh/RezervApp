import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sendBookingConfirmation } from "@/lib/email"
import { sendBookingConfirmationSMS } from "@/lib/sms"
import { addMinutes, isAfter, isBefore, parseISO, format } from "date-fns"

const bookingRequestSchema = z.object({
  restaurantId: z.string(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(9),
  date: z.string(),
  time: z.string(),
  partySize: z.string(),
  specialRequests: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = bookingRequestSchema.parse(body)

    // Get restaurant with settings
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: "Étterem nem található" },
        { status: 404 }
      )
    }

    // Create booking date/time
    const bookingDateTime = new Date(`${data.date}T${data.time}:00`)
    const now = new Date()

    // Validate minimum advance booking time
    const minBookingTime = addMinutes(now, restaurant.minAdvanceHours * 60)
    if (isBefore(bookingDateTime, minBookingTime)) {
      return NextResponse.json(
        { error: `Foglalás legalább ${restaurant.minAdvanceHours} órával előre szükséges` },
        { status: 400 }
      )
    }

    // Validate maximum advance booking time
    const maxBookingDate = new Date()
    maxBookingDate.setDate(maxBookingDate.getDate() + restaurant.maxAdvanceDays)
    if (isAfter(bookingDateTime, maxBookingDate)) {
      return NextResponse.json(
        { error: `Foglalás legfeljebb ${restaurant.maxAdvanceDays} nappal előre lehetséges` },
        { status: 400 }
      )
    }

    // Validate opening hours
    let openingHours: any = {}
    try {
      openingHours = JSON.parse(restaurant.openingHours)
    } catch {
      // Use default if not set
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

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[bookingDateTime.getDay()]
    const dayHours = openingHours[dayName]

    if (!dayHours || dayHours.closed) {
      return NextResponse.json(
        { error: "Az étterem ezen a napon zárva tart" },
        { status: 400 }
      )
    }

    const bookingTime = format(bookingDateTime, 'HH:mm')
    const bookingEndTime = format(addMinutes(bookingDateTime, restaurant.slotDuration), 'HH:mm')

    if (bookingTime < dayHours.open || bookingEndTime > dayHours.close) {
      return NextResponse.json(
        { error: `Az étterem nyitvatartása: ${dayHours.open} - ${dayHours.close}` },
        { status: 400 }
      )
    }

    // Find or create guest
    let guest = await prisma.guest.findUnique({
      where: {
        restaurantId_phone: {
          restaurantId: data.restaurantId,
          phone: data.phone,
        },
      },
    })

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          restaurantId: data.restaurantId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || null,
          phone: data.phone,
          totalBookings: 0,
          noShowCount: 0,
        },
      })
    }

    // Find available table for the party size
    const partySize = parseInt(data.partySize)
    const duration = 120 // Default 2 hours
    const bookingEndDateTime = addMinutes(bookingDateTime, duration)

    // Find all suitable tables
    const suitableTables = await prisma.table.findMany({
      where: {
        restaurantId: data.restaurantId,
        isActive: true,
        capacity: {
          gte: partySize,
        },
      },
      orderBy: {
        capacity: 'asc', // Get the smallest table that fits
      },
    })

    if (suitableTables.length === 0) {
      return NextResponse.json(
        { error: "Nincs megfelelő asztal erre a létszámra" },
        { status: 400 }
      )
    }

    // Check for conflicts with proper duration handling
    let availableTable = null
    for (const table of suitableTables) {
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          tableId: table.id,
          status: {
            in: ['PENDING', 'CONFIRMED', 'SEATED'],
          },
        },
      })

      let hasConflict = false
      for (const booking of conflictingBookings) {
        const existingEnd = addMinutes(booking.bookingDate, booking.duration)

        // Check if there's any overlap
        const startsBeforeExistingEnds = isBefore(bookingDateTime, existingEnd) || bookingDateTime.getTime() === existingEnd.getTime()
        const endsAfterExistingStarts = isAfter(bookingEndDateTime, booking.bookingDate) || bookingEndDateTime.getTime() === booking.bookingDate.getTime()

        if (startsBeforeExistingEnds && endsAfterExistingStarts) {
          hasConflict = true
          break
        }
      }

      if (!hasConflict) {
        availableTable = table
        break
      }
    }

    if (!availableTable) {
      return NextResponse.json(
        { error: "Ez az időpont már foglalt. Kérlek válassz másik időpontot!" },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        restaurantId: data.restaurantId,
        guestId: guest.id,
        tableId: availableTable.id,
        bookingDate: bookingDateTime,
        partySize,
        duration, // Use the validated duration
        status: "CONFIRMED",
        specialRequests: data.specialRequests || null,
        confirmationSent: false,
        reminderSent: false,
      },
    })

    // Update guest statistics
    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        totalBookings: {
          increment: 1,
        },
      },
    })

    // Send confirmation email (if email provided and RESEND configured)
    if (data.email && restaurant) {
      await sendBookingConfirmation({
        to: data.email,
        guestName: `${data.firstName} ${data.lastName}`,
        restaurantName: restaurant.name,
        restaurantId: restaurant.id,
        bookingDate: bookingDateTime,
        partySize,
        tableName: availableTable.name,
        specialRequests: data.specialRequests,
        cancelToken: booking.cancelToken,
      })

      // Mark confirmation as sent
      await prisma.booking.update({
        where: { id: booking.id },
        data: { confirmationSent: true },
      })
    }

    // Send confirmation SMS (if Twilio configured)
    if (data.phone && restaurant) {
      await sendBookingConfirmationSMS({
        to: data.phone,
        guestName: `${data.firstName} ${data.lastName}`,
        restaurantName: restaurant.name,
        restaurantId: restaurant.id,
        bookingDate: bookingDateTime,
        partySize,
      })
    }

    return NextResponse.json({
      id: booking.id,
      message: "Foglalás sikeresen létrehozva",
      booking,
    })
  } catch (error) {
    console.error("Booking creation error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Érvénytelen adatok", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Hiba történt a foglalás létrehozása során" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        guest: true,
        table: true,
        restaurant: true,
      },
      orderBy: {
        bookingDate: 'desc',
      },
      take: 100,
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Get bookings error:", error)
    return NextResponse.json(
      { error: "Hiba történt a foglalások lekérése során" },
      { status: 500 }
    )
  }
}
