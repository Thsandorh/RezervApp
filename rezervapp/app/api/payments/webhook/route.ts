import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import type Stripe from "stripe"

export async function POST(request: Request) {
  // Check if Stripe is configured
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    )
  }

  const body = await request.text()
  const signature = (await headers()).get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    )
  }

  // Get webhook secret from environment
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId

      if (bookingId) {
        try {
          // Update booking status to confirmed and add payment info
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              status: "CONFIRMED",
              internalNotes: `Fizetés befejezve - Stripe Session: ${session.id}\nÖsszeg: ${session.amount_total ? session.amount_total / 100 : 0} ${session.currency?.toUpperCase()}`,
            },
          })

          console.log(`Booking ${bookingId} payment confirmed`)
        } catch (error) {
          console.error("Error updating booking after payment:", error)
        }
      }
      break
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId

      if (bookingId) {
        try {
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              internalNotes: `Fizetési session lejárt - Stripe Session: ${session.id}`,
            },
          })

          console.log(`Booking ${bookingId} payment session expired`)
        } catch (error) {
          console.error("Error updating booking after expiry:", error)
        }
      }
      break
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log(`PaymentIntent ${paymentIntent.id} succeeded`)
      break
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log(`PaymentIntent ${paymentIntent.id} failed`)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
