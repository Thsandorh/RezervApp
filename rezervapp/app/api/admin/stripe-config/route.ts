import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encrypt, decrypt, maskSecret } from "@/lib/encryption"
import { z } from "zod"

const stripeConfigSchema = z.object({
  secretKey: z.string().min(1, "Secret Key kötelező"),
  webhookSecret: z.string().optional(),
})

/**
 * GET /api/admin/stripe-config
 * Fetch current Stripe configuration (masked)
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized - csak tulajdonos" },
        { status: 403 }
      )
    }

    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: session.user.restaurantId,
      },
      select: {
        stripeSecretKey: true,
        stripeWebhookSecret: true,
      },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: "Étterem nem található" },
        { status: 404 }
      )
    }

    // Check if environment variables are set (they take priority)
    const envSecretKey = process.env.STRIPE_SECRET_KEY
    const envWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    const response: any = {
      configured: !!(envSecretKey || restaurant.stripeSecretKey),
      source: envSecretKey ? "environment" : restaurant.stripeSecretKey ? "database" : "none",
    }

    // Return masked versions if configured
    if (envSecretKey) {
      response.secretKey = maskSecret(envSecretKey)
      response.webhookSecret = envWebhookSecret ? maskSecret(envWebhookSecret) : null
    } else if (restaurant.stripeSecretKey) {
      try {
        const decryptedKey = decrypt(restaurant.stripeSecretKey)
        response.secretKey = maskSecret(decryptedKey)

        if (restaurant.stripeWebhookSecret) {
          const decryptedWebhook = decrypt(restaurant.stripeWebhookSecret)
          response.webhookSecret = maskSecret(decryptedWebhook)
        }
      } catch (error) {
        console.error("Failed to decrypt Stripe keys:", error)
        return NextResponse.json(
          { error: "Stripe kulcsok visszafejtése sikertelen" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching Stripe config:", error)
    return NextResponse.json(
      { error: "Hiba történt" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/stripe-config
 * Save Stripe configuration (encrypted)
 */
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized - csak tulajdonos módosíthatja" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { secretKey, webhookSecret } = stripeConfigSchema.parse(body)

    // Validate Stripe key format
    if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
      return NextResponse.json(
        { error: "Érvénytelen Stripe Secret Key formátum (sk_test_... vagy sk_live_...)" },
        { status: 400 }
      )
    }

    if (webhookSecret && !webhookSecret.startsWith("whsec_")) {
      return NextResponse.json(
        { error: "Érvénytelen Webhook Secret formátum (whsec_...)" },
        { status: 400 }
      )
    }

    // Encrypt the keys
    const encryptedSecretKey = encrypt(secretKey)
    const encryptedWebhookSecret = webhookSecret ? encrypt(webhookSecret) : null

    // Save to database
    await prisma.restaurant.update({
      where: {
        id: session.user.restaurantId,
      },
      data: {
        stripeSecretKey: encryptedSecretKey,
        stripeWebhookSecret: encryptedWebhookSecret,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Stripe konfiguráció sikeresen mentve",
      masked: {
        secretKey: maskSecret(secretKey),
        webhookSecret: webhookSecret ? maskSecret(webhookSecret) : null,
      },
    })
  } catch (error) {
    console.error("Error saving Stripe config:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Hibás adatok", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Hiba történt a mentés során" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/stripe-config
 * Remove Stripe configuration from database
 */
export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized - csak tulajdonos törölheti" },
        { status: 403 }
      )
    }

    await prisma.restaurant.update({
      where: {
        id: session.user.restaurantId,
      },
      data: {
        stripeSecretKey: null,
        stripeWebhookSecret: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Stripe konfiguráció törölve",
    })
  } catch (error) {
    console.error("Error deleting Stripe config:", error)
    return NextResponse.json(
      { error: "Hiba történt a törlés során" },
      { status: 500 }
    )
  }
}
