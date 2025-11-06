import { Resend } from "resend"
import { render } from "@react-email/components"
import BookingConfirmationEmail from "@/emails/booking-confirmation"
import { format } from "date-fns"
import { hu } from "date-fns/locale"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendBookingConfirmationParams {
  to: string
  guestName: string
  restaurantName: string
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
  bookingDate,
  partySize,
  tableName,
  specialRequests,
  cancelToken,
}: SendBookingConfirmationParams) {
  // Only send if RESEND_API_KEY is configured
  if (!process.env.RESEND_API_KEY) {
    console.log("⚠️  RESEND_API_KEY not configured - email not sent")
    console.log("📧 Would send email to:", to)
    return { success: false, message: "Email service not configured" }
  }

  try {
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
