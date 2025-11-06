import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const settingsSchema = z.object({
  restaurantId: z.string(),
  resendApiKey: z.string().optional(),
  twilioAccountSid: z.string().optional(),
  twilioAuthToken: z.string().optional(),
  twilioPhoneNumber: z.string().optional(),
  stripeApiKey: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get("restaurantId")

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID szükséges" },
        { status: 400 }
      )
    }

    const settings = await prisma.settings.findUnique({
      where: { restaurantId },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Hiba történt a beállítások betöltésekor" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = settingsSchema.parse(body)

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: "Étterem nem található" },
        { status: 404 }
      )
    }

    // Upsert settings
    const settings = await prisma.settings.upsert({
      where: { restaurantId: data.restaurantId },
      update: {
        resendApiKey: data.resendApiKey || null,
        twilioAccountSid: data.twilioAccountSid || null,
        twilioAuthToken: data.twilioAuthToken || null,
        twilioPhoneNumber: data.twilioPhoneNumber || null,
        stripeApiKey: data.stripeApiKey || null,
        googleAnalyticsId: data.googleAnalyticsId || null,
      },
      create: {
        restaurantId: data.restaurantId,
        resendApiKey: data.resendApiKey || null,
        twilioAccountSid: data.twilioAccountSid || null,
        twilioAuthToken: data.twilioAuthToken || null,
        twilioPhoneNumber: data.twilioPhoneNumber || null,
        stripeApiKey: data.stripeApiKey || null,
        googleAnalyticsId: data.googleAnalyticsId || null,
      },
    })

    return NextResponse.json({
      message: "Beállítások sikeresen mentve!",
      settings,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Érvénytelen adatok", issues: error.issues },
        { status: 400 }
      )
    }

    console.error("Error saving settings:", error)
    return NextResponse.json(
      { error: "Hiba történt a beállítások mentésekor" },
      { status: 500 }
    )
  }
}
