import { NextResponse } from "next/server"
import { verifySimplePayIPN, getSimplePayConfig } from "@/lib/simplepay"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { signature, ...data } = body

    // Get SimplePay config for verification
    const config = await getSimplePayConfig()

    if (!config) {
      console.error("SimplePay IPN: Configuration not found")
      return NextResponse.json({ receiveDate: new Date().toISOString() })
    }

    // Verify signature
    const isValid = verifySimplePayIPN(data, signature, config.secretKey)

    if (!isValid) {
      console.error("SimplePay IPN: Invalid signature")
      return NextResponse.json({ receiveDate: new Date().toISOString() })
    }

    // Extract booking ID from orderRef
    const orderRef = data.orderRef as string
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
    const status = data.status as string

    if (status === "FINISHED" || status === "SUCCESS") {
      // Payment successful
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          internalNotes: booking.internalNotes
            ? `${booking.internalNotes}\nSimplePay Payment: SUCCESS (${data.transactionId})`
            : `SimplePay Payment: SUCCESS (${data.transactionId})`,
        },
      })

      console.log(`SimplePay IPN: Booking ${bookingId} payment confirmed`)
    } else if (status === "TIMEOUT" || status === "FAIL" || status === "CANCELLED") {
      // Payment failed or cancelled
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          internalNotes: booking.internalNotes
            ? `${booking.internalNotes}\nSimplePay Payment: ${status} (${data.transactionId})`
            : `SimplePay Payment: ${status} (${data.transactionId})`,
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
