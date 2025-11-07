import { NextResponse } from "next/server"
import { createSimplePayPayment } from "@/lib/simplepay"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const checkoutSchema = z.object({
  bookingId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default("HUF"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId, amount, currency } = checkoutSchema.parse(body)

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        table: true,
        restaurant: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Foglalás nem található" },
        { status: 404 }
      )
    }

    // Calculate timeout (15 minutes from now)
    const timeout = new Date()
    timeout.setMinutes(timeout.getMinutes() + 15)

    // Create SimplePay payment
    const payment = await createSimplePayPayment({
      orderRef: `BOOKING-${bookingId}`,
      amount: Math.round(amount), // SimplePay uses whole numbers (no decimals)
      currency: currency.toUpperCase(),
      customerEmail: booking.guest.email || booking.restaurant.email,
      language: "HU",
      timeout,
      methods: ["CARD"], // Card payments
      url: `${process.env.NEXTAUTH_URL}/api/payments/simplepay-ipn`,
      successUrl: `${process.env.NEXTAUTH_URL}/booking/success?booking_id=${bookingId}`,
      failUrl: `${process.env.NEXTAUTH_URL}/booking/failed?booking_id=${bookingId}`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/booking/cancelled?booking_id=${bookingId}`,
      invoice: {
        name: `${booking.guest.lastName} ${booking.guest.firstName}`,
        country: "HU",
        city: booking.restaurant.city,
        zip: booking.restaurant.postalCode,
        address: booking.restaurant.address,
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: "SimplePay fizetés létrehozása sikertelen" },
        { status: 500 }
      )
    }

    // Update booking with payment transaction ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        internalNotes: booking.internalNotes
          ? `${booking.internalNotes}\nSimplePay Transaction: ${payment.transactionId}`
          : `SimplePay Transaction: ${payment.transactionId}`,
      },
    })

    return NextResponse.json({
      transactionId: payment.transactionId,
      url: payment.url,
    })
  } catch (error) {
    console.error("SimplePay checkout error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Hibás adatok", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Hiba történt a fizetési folyamat indításakor" },
      { status: 500 }
    )
  }
}
