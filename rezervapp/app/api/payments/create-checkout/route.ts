import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const checkoutSchema = z.object({
  bookingId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default("huf"),
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
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Foglalás nem található" },
        { status: 404 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Foglalás - ${booking.table?.name || "Asztal"}`,
              description: `${booking.partySize} fő - ${new Date(booking.bookingDate).toLocaleString("hu-HU")}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents/fillér
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/booking/cancelled?booking_id=${bookingId}`,
      client_reference_id: bookingId,
      customer_email: booking.guest.email || undefined,
      metadata: {
        bookingId: booking.id,
        guestId: booking.guest.id,
        tableId: booking.table?.id || "",
      },
    })

    // Update booking with payment session ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        internalNotes: booking.internalNotes
          ? `${booking.internalNotes}\nStripe Session: ${session.id}`
          : `Stripe Session: ${session.id}`,
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("Stripe checkout error:", error)

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
