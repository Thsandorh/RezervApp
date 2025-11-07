import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateBookingSchema = z.object({
  status: z.string().optional(),
  internalNotes: z.string().nullable().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: true,
        table: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Foglalás nem található" },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json(
      { error: "Hiba történt a foglalás betöltésekor" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = updateBookingSchema.parse(body)

    const booking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Foglalás nem található" },
        { status: 404 }
      )
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: data.status || booking.status,
        internalNotes: data.internalNotes !== undefined ? data.internalNotes : booking.internalNotes,
      },
      include: {
        guest: true,
        table: true,
      },
    })

    return NextResponse.json({
      message: "Foglalás sikeresen frissítve!",
      booking: updatedBooking,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Érvénytelen adatok", issues: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating booking:", error)
    return NextResponse.json(
      { error: "Hiba történt a foglalás frissítésekor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const booking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Foglalás nem található" },
        { status: 404 }
      )
    }

    await prisma.booking.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Foglalás sikeresen törölve!",
    })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json(
      { error: "Hiba történt a foglalás törlésekor" },
      { status: 500 }
    )
  }
}
