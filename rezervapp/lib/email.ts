import { Resend } from "resend"
import { render } from "@react-email/components"
import BookingConfirmationEmail from "@/emails/booking-confirmation"
import { format } from "date-fns"
import { hu } from "date-fns/locale"
import { prisma } from "@/lib/prisma"

// Get Resend API key from Settings or environment variable
async function getResendApiKey(restaurantId?: string): Promise<string | null> {
  // Try to get from Settings if restaurantId provided
  if (restaurantId) {
    const settings = await prisma.settings.findUnique({
      where: { restaurantId },
    })

    if (settings?.resendApiKey) {
      return settings.resendApiKey
    }
  }

  // Fallback to environment variable
  return process.env.RESEND_API_KEY || null
}

interface SendBookingConfirmationParams {
  to: string
  guestName: string
  restaurantName: string
  restaurantId: string
  bookingDate: Date
  partySize: number
  tableName?: string
  specialRequests?: string
  cancelToken: string
}

export async function sendBookingConfirmation({
  to,
  guestName,
  restaurantName,
  restaurantId,
  bookingDate,
  partySize,
  tableName,
  specialRequests,
  cancelToken,
}: SendBookingConfirmationParams) {
  const apiKey = await getResendApiKey(restaurantId)

  // Only send if API key is configured
  if (!apiKey) {
    console.log("⚠️  Resend API Key not configured - email not sent")
    console.log("📧 Would send email to:", to)
    console.log("💡 Add Resend API key in Settings to enable emails")
    return { success: false, message: "Email service not configured" }
  }

  try {
    const resend = new Resend(apiKey)

    const formattedDate = format(bookingDate, "yyyy. MMMM d. (EEEE)", {
      locale: hu,
    })
    const formattedTime = format(bookingDate, "HH:mm")

    const cancelUrl = `${process.env.NEXTAUTH_URL}/booking/cancel/${cancelToken}`

    const emailHtml = await render(
      BookingConfirmationEmail({
        guestName,
        restaurantName,
        bookingDate: formattedDate,
        bookingTime: formattedTime,
        partySize,
        tableName,
        specialRequests,
        cancelUrl,
      })
    )

    const { data, error } = await resend.emails.send({
      from: `${restaurantName} <foglalasok@rezervapp.hu>`,
      to: [to],
      subject: `Foglalásod megerősítve - ${restaurantName}`,
      html: emailHtml,
    })

    if (error) {
      console.error("❌ Email sending error:", error)
      return { success: false, message: error.message }
    }

    console.log("✅ Booking confirmation email sent:", data?.id)
    return { success: true, emailId: data?.id }
  } catch (error) {
    console.error("❌ Email sending failed:", error)
    return { success: false, message: String(error) }
  }
}

interface SendBookingReminderParams {
  to: string
  guestName: string
  restaurantName: string
  restaurantId: string
  bookingDate: Date
  partySize: number
  tableName?: string
  restaurantAddress?: string
  restaurantPhone?: string
}

export async function sendBookingReminder({
  to,
  guestName,
  restaurantName,
  restaurantId,
  bookingDate,
  partySize,
  tableName,
  restaurantAddress,
  restaurantPhone,
}: SendBookingReminderParams) {
  const apiKey = await getResendApiKey(restaurantId)

  if (!apiKey) {
    console.log("⚠️  Resend API Key not configured - reminder not sent")
    return { success: false, message: "Email service not configured" }
  }

  try {
    const resend = new Resend(apiKey)

    const formattedDate = format(bookingDate, "yyyy. MMMM d. (EEEE)", {
      locale: hu,
    })
    const formattedTime = format(bookingDate, "HH:mm")

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Foglalás emlékeztető</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Emlékeztető: Holnap érkezés!</h2>

            <p>Kedves ${guestName}!</p>

            <p><strong>Emlékeztetünk</strong>, hogy holnap foglalásod van nálunk:</p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Étterem:</strong> ${restaurantName}</p>
              <p style="margin: 5px 0;"><strong>Dátum:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0;"><strong>Időpont:</strong> ${formattedTime}</p>
              <p style="margin: 5px 0;"><strong>Létszám:</strong> ${partySize} fő</p>
              ${tableName ? `<p style="margin: 5px 0;"><strong>Asztal:</strong> ${tableName}</p>` : ''}
            </div>

            ${restaurantAddress ? `<p><strong>Cím:</strong> ${restaurantAddress}</p>` : ''}
            ${restaurantPhone ? `<p><strong>Telefon:</strong> ${restaurantPhone}</p>` : ''}

            <p>Várunk szeretettel! 🍽️</p>

            <p style="color: #666; font-size: 12px; margin-top: 40px;">
              Ez egy automatikus emlékeztető. Kérjük ne válaszolj erre az emailre.
            </p>
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: `${restaurantName} <emlekezteto@rezervapp.hu>`,
      to: [to],
      subject: `Emlékeztető: Holnap foglalásod van - ${restaurantName}`,
      html: emailHtml,
    })

    if (error) {
      console.error("❌ Reminder email error:", error)
      return { success: false, message: error.message }
    }

    console.log("✅ Booking reminder email sent:", data?.id)
    return { success: true, emailId: data?.id }
  } catch (error) {
    console.error("❌ Reminder email failed:", error)
    return { success: false, message: String(error) }
  }
}
