import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendBookingReminder } from "@/lib/email"
import { sendBookingReminderSMS } from "@/lib/sms"
import { addHours, subHours, isAfter, isBefore } from "date-fns"

/**
 * API endpoint to send booking reminders (email + SMS)
 * Should be called by a cron job every hour
 * Sends reminders for bookings happening in 24 hours
 */
export async function POST(request: Request) {
  try {
    // Verify authorization (optional: add API key check)
    const authHeader = request.headers.get("authorization")
    const apiKey = process.env.CRON_API_KEY

    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const reminderWindowStart = addHours(now, 23) // 23 hours from now
    const reminderWindowEnd = addHours(now, 24) // 24 hours from now

    // Find bookings that need reminders
    const bookingsToRemind = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: reminderWindowStart,
          lte: reminderWindowEnd,
        },
        status: {
          in: ["CONFIRMED", "PENDING"],
        },
        reminderSent: false,
      },
      include: {
        guest: true,
        table: true,
        restaurant: true,
      },
    })

    console.log(`📅 Found ${bookingsToRemind.length} bookings to remind`)

    const results = {
      total: bookingsToRemind.length,
      emailsSent: 0,
      smsSent: 0,
      errors: 0,
    }

    for (const booking of bookingsToRemind) {
      try {
        // Send email reminder
        if (booking.guest.email) {
          const emailResult = await sendBookingReminder({
            to: booking.guest.email,
            guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
            restaurantName: booking.restaurant.name,
            restaurantId: booking.restaurant.id,
            bookingDate: booking.bookingDate,
            partySize: booking.partySize,
            tableName: booking.table?.name,
            restaurantAddress: booking.restaurant.address,
            restaurantPhone: booking.restaurant.phone,
          })

          if (emailResult.success) {
            results.emailsSent++
          }
        }

        // Send SMS reminder
        if (booking.guest.phone) {
          const smsResult = await sendBookingReminderSMS({
            to: booking.guest.phone,
            guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
            restaurantName: booking.restaurant.name,
            restaurantId: booking.restaurant.id,
            bookingDate: booking.bookingDate,
            partySize: booking.partySize,
            restaurantAddress: booking.restaurant.address,
          })

          if (smsResult.success) {
            results.smsSent++
          }
        }

        // Mark reminder as sent
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent: true },
        })
      } catch (error) {
        console.error(`Error sending reminder for booking ${booking.id}:`, error)
        results.errors++
      }
    }

    console.log("📊 Reminder results:", results)

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error("Reminder sending error:", error)
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    )
  }
}
