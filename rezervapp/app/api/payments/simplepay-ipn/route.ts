import { NextResponse } from "next/server"
import { verifySimplePayIPN, getSimplePayConfig } from "@/lib/simplepay"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    // Get raw body text for signature verification
    const bodyText = await request.text()
    const body = JSON.parse(bodyText)

    // Get signature from header (SimplePay sends it in the Signature header)
    const signature = request.headers.get("Signature")

    if (!signature) {
      console.error("SimplePay IPN: No signature in header")
      return NextResponse.json({ receiveDate: new Date().toISOString() })
    }

    // Get SimplePay config for verification
    const config = await getSimplePayConfig()

    if (!config) {
      console.error("SimplePay IPN: Configuration not found")
      return NextResponse.json({ receiveDate: new Date().toISOString() })
    }

    // Verify signature using the raw body text
    const isValid = verifySimplePayIPN(bodyText, signature, config.secretKey)

    if (!isValid) {
      console.error("SimplePay IPN: Invalid signature")
      return NextResponse.json({ receiveDate: new Date().toISOString() })
    }

    // Extract booking ID from orderRef
    const orderRef = body.orderRef as string
    const bookingId = orderRef.replace("BOOKING-", "")

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      console.error(`SimplePay IPN: Booking ${bookingId} not found`)
      return NextResponse.json({ receiveDate: new Date().toISOString() })
    }

    // Update booking status based on payment status
    const status = body.status as string

    if (status === "FINISHED" || status === "SUCCESS") {
      // Payment successful
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          internalNotes: booking.internalNotes
            ? `${booking.internalNotes}\nSimplePay Payment: SUCCESS (${body.transactionId})`
            : `SimplePay Payment: SUCCESS (${body.transactionId})`,
        },
      })

      console.log(`SimplePay IPN: Booking ${bookingId} payment confirmed`)
    } else if (status === "TIMEOUT" || status === "FAIL" || status === "CANCELLED") {
      // Payment failed or cancelled
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          internalNotes: booking.internalNotes
            ? `${booking.internalNotes}\nSimplePay Payment: ${status} (${body.transactionId})`
            : `SimplePay Payment: ${status} (${body.transactionId})`,
        },
      })

      console.log(`SimplePay IPN: Booking ${bookingId} payment ${status}`)
    }

    // Return required response
    return NextResponse.json({ receiveDate: new Date().toISOString() })
  } catch (error) {
    console.error("SimplePay IPN error:", error)
    // Still return success to SimplePay to avoid retries
    return NextResponse.json({ receiveDate: new Date().toISOString() })
  }
}
