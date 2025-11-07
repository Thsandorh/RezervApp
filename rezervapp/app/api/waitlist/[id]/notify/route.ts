import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendBookingReminderSMS } from "@/lib/sms"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const entry = await prisma.waitlist.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json(
        { error: "Waitlist entry not found" },
        { status: 404 }
      )
    }

    if (entry.status !== "WAITING") {
      return NextResponse.json(
        { error: "Entry already processed" },
        { status: 400 }
      )
    }

    // Get restaurant info
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: entry.restaurantId },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      )
    }

    // Send SMS notification
    await sendBookingReminderSMS({
      to: entry.guestPhone,
      guestName: entry.guestName,
      restaurantName: restaurant.name,
      restaurantId: restaurant.id,
      bookingDate: new Date(), // Placeholder - they should call to book
      partySize: entry.partySize,
      restaurantAddress: restaurant.address,
    })

    // Update status
    const updated = await prisma.waitlist.update({
      where: { id },
      data: {
        status: "NOTIFIED",
        notifiedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      entry: updated,
    })
  } catch (error) {
    console.error("Waitlist notify error:", error)
    return NextResponse.json(
      { error: "Failed to notify guest" },
      { status: 500 }
    )
  }
}
