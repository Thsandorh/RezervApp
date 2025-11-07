import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { hu } from "date-fns/locale/hu"

// Get Twilio credentials from Settings or environment variables
async function getTwilioCredentials(restaurantId?: string): Promise<{
  accountSid: string | null
  authToken: string | null
  phoneNumber: string | null
}> {
  // Try to get from Settings if restaurantId provided
  if (restaurantId) {
    const settings = await prisma.settings.findUnique({
      where: { restaurantId },
    })

    if (
      settings?.twilioAccountSid &&
      settings?.twilioAuthToken &&
      settings?.twilioPhoneNumber
    ) {
      return {
        accountSid: settings.twilioAccountSid,
        authToken: settings.twilioAuthToken,
        phoneNumber: settings.twilioPhoneNumber,
      }
    }
  }

  // Fallback to environment variables
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID || null,
    authToken: process.env.TWILIO_AUTH_TOKEN || null,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || null,
  }
}

interface SendBookingConfirmationSMSParams {
  to: string
  guestName: string
  restaurantName: string
  restaurantId: string
  bookingDate: Date
  partySize: number
}

export async function sendBookingConfirmationSMS({
  to,
  guestName,
  restaurantName,
  restaurantId,
  bookingDate,
  partySize,
}: SendBookingConfirmationSMSParams) {
  const credentials = await getTwilioCredentials(restaurantId)

  // Only send if Twilio is configured
  if (!credentials.accountSid || !credentials.authToken || !credentials.phoneNumber) {
    console.log("⚠️  Twilio not configured - SMS not sent")
    console.log("📱 Would send SMS to:", to)
    console.log("💡 Add Twilio credentials in Settings to enable SMS")
    return { success: false, message: "SMS service not configured" }
  }

  try {
    // Use dynamic import for Twilio to avoid build issues if not installed
    const twilio = require("twilio")
    const client = twilio(credentials.accountSid, credentials.authToken)

    const formattedDate = format(bookingDate, "yyyy. MMMM d. (EEEE)", {
      locale: hu,
    })
    const formattedTime = format(bookingDate, "HH:mm")

    const message = `Foglalás megerősítve! ${restaurantName} - ${formattedDate}, ${formattedTime}, ${partySize} fő. Várunk szeretettel!`

    const result = await client.messages.create({
      body: message,
      from: credentials.phoneNumber,
      to: to,
    })

    console.log("✅ Booking confirmation SMS sent:", result.sid)
    return { success: true, messageSid: result.sid }
  } catch (error) {
    console.error("❌ SMS sending failed:", error)
    return { success: false, message: String(error) }
  }
}

interface SendBookingReminderSMSParams {
  to: string
  guestName: string
  restaurantName: string
  restaurantId: string
  bookingDate: Date
  partySize: number
  restaurantAddress?: string
}

export async function sendBookingReminderSMS({
  to,
  guestName,
  restaurantName,
  restaurantId,
  bookingDate,
  partySize,
  restaurantAddress,
}: SendBookingReminderSMSParams) {
  const credentials = await getTwilioCredentials(restaurantId)

  if (!credentials.accountSid || !credentials.authToken || !credentials.phoneNumber) {
    console.log("⚠️  Twilio not configured - reminder SMS not sent")
    return { success: false, message: "SMS service not configured" }
  }

  try {
    const twilio = require("twilio")
    const client = twilio(credentials.accountSid, credentials.authToken)

    const formattedDate = format(bookingDate, "yyyy. MMMM d. (EEEE)", {
      locale: hu,
    })
    const formattedTime = format(bookingDate, "HH:mm")

    let message = `Emlékeztető: Holnap foglalásod van! ${restaurantName} - ${formattedDate}, ${formattedTime}, ${partySize} fő.`

    if (restaurantAddress) {
      message += ` Cím: ${restaurantAddress}`
    }

    const result = await client.messages.create({
      body: message,
      from: credentials.phoneNumber,
      to: to,
    })

    console.log("✅ Booking reminder SMS sent:", result.sid)
    return { success: true, messageSid: result.sid }
  } catch (error) {
    console.error("❌ Reminder SMS failed:", error)
    return { success: false, message: String(error) }
  }
}
