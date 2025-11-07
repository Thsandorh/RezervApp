import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const editSchema = z.object({
  bookingDate: z.string().datetime(),
  partySize: z.number().int().min(1).max(20),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    // Validate input
    const data = editSchema.parse(body)

    // Find the booking by token
    const booking = await prisma.booking.findFirst({
      where: {
        cancelToken: token,
        status: {
          notIn: ["CANCELLED", "COMPLETED"],
        },
      },
      include: {
        restaurant: true,
        guest: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Foglalás nem található vagy már le van zárva" },
        { status: 404 }
      )
    }

    // Validate new booking date
    const newBookingDate = new Date(data.bookingDate)
    const now = new Date()

    // Check minimum advance time
    const minAdvanceMs = booking.restaurant.minAdvanceHours * 60 * 60 * 1000
    const minDateTime = new Date(now.getTime() + minAdvanceMs)

    if (newBookingDate < minDateTime) {
      return NextResponse.json(
        { error: `Minimum ${booking.restaurant.minAdvanceHours} órával előre kell foglalni` },
        { status: 400 }
      )
    }

    // Check maximum advance time
    const maxDateTime = new Date(now.getTime() + booking.restaurant.maxAdvanceDays * 24 * 60 * 60 * 1000)

    if (newBookingDate > maxDateTime) {
      return NextResponse.json(
        { error: `Maximum ${booking.restaurant.maxAdvanceDays} nappal előre lehet foglalni` },
        { status: 400 }
      )
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        bookingDate: newBookingDate,
        partySize: data.partySize,
        // Reset status to PENDING if changed significantly
        status: booking.bookingDate.getTime() !== newBookingDate.getTime() ? "PENDING" : booking.status,
      },
      include: {
        guest: true,
        table: true,
        restaurant: true,
      },
    })

    // TODO: Send email notification about the change
    // This would be similar to sendBookingConfirmation but with "Foglalás módosítva" subject

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    })
  } catch (error) {
    console.error("Booking edit error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Hibás adatok", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Hiba történt a módosítás során" },
      { status: 500 }
    )
  }
}
