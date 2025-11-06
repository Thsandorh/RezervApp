import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sendBookingConfirmation } from "@/lib/email"

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
    const availableTable = await prisma.table.findFirst({
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

    // Create booking date/time
    const bookingDateTime = new Date(`${data.date}T${data.time}:00`)

    // Check for conflicts
    if (availableTable) {
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          tableId: availableTable.id,
          bookingDate: bookingDateTime,
          status: {
            in: ['PENDING', 'CONFIRMED', 'SEATED'],
          },
        },
      })

      if (conflictingBooking) {
        return NextResponse.json(
          { error: "Ez az időpont már foglalt" },
          { status: 400 }
        )
      }
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        restaurantId: data.restaurantId,
        guestId: guest.id,
        tableId: availableTable?.id || null,
        bookingDate: bookingDateTime,
        partySize,
        duration: 120, // Default 2 hours
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

    // Get restaurant name for email
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
    })

    // Send confirmation email (if email provided and RESEND configured)
    if (data.email && restaurant) {
      await sendBookingConfirmation({
        to: data.email,
        guestName: `${data.firstName} ${data.lastName}`,
        restaurantName: restaurant.name,
        bookingDate: bookingDateTime,
        partySize,
        tableName: availableTable?.name,
        specialRequests: data.specialRequests,
        cancelToken: booking.cancelToken,
      })

      // Mark confirmation as sent
      await prisma.booking.update({
        where: { id: booking.id },
        data: { confirmationSent: true },
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
        { error: "Érvénytelen adatok", details: error.errors },
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
