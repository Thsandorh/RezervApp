import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET public reCAPTCHA configuration
export async function GET() {
  try {
    // Try to get site key from database first
    const restaurant = await prisma.restaurant.findFirst({
      select: {
        recaptchaSiteKey: true,
      },
    })

    const siteKey = restaurant?.recaptchaSiteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || null

    return NextResponse.json({ siteKey })
  } catch (error) {
    console.error("[RECAPTCHA_CONFIG_GET]", error)
    // Return env variable as fallback
    return NextResponse.json({
      siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || null,
    })
  }
}
