import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encrypt, decrypt, maskSecret } from "@/lib/encryption"
import { z } from "zod"

const simplePayConfigSchema = z.object({
  merchantId: z.string().min(1, "Merchant ID kötelező"),
  secretKey: z.string().min(1, "Secret Key kötelező"),
  sandboxMode: z.boolean().default(true),
})

/**
 * GET /api/admin/simplepay-config
 * Fetch current SimplePay configuration (masked)
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
        simplePayMerchantId: true,
        simplePaySecretKey: true,
        simplePaySandboxMode: true,
      },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: "Étterem nem található" },
        { status: 404 }
      )
    }

    // Check if environment variables are set (they take priority)
    const envMerchantId = process.env.SIMPLEPAY_MERCHANT_ID
    const envSecretKey = process.env.SIMPLEPAY_SECRET_KEY
    const envSandboxMode = process.env.SIMPLEPAY_SANDBOX_MODE === "true"

    const response: any = {
      configured: !!(envMerchantId || restaurant.simplePayMerchantId),
      source: envMerchantId ? "environment" : restaurant.simplePayMerchantId ? "database" : "none",
    }

    // Return masked versions if configured
    if (envMerchantId) {
      response.merchantId = maskSecret(envMerchantId)
      response.secretKey = "****"
      response.sandboxMode = envSandboxMode
    } else if (restaurant.simplePayMerchantId) {
      try {
        const decryptedMerchantId = decrypt(restaurant.simplePayMerchantId)
        response.merchantId = maskSecret(decryptedMerchantId)
        response.secretKey = "****"
        response.sandboxMode = restaurant.simplePaySandboxMode ?? true
      } catch (error) {
        console.error("Failed to decrypt SimplePay keys:", error)
        return NextResponse.json(
          { error: "SimplePay kulcsok visszafejtése sikertelen" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching SimplePay config:", error)
    return NextResponse.json(
      { error: "Hiba történt" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/simplepay-config
 * Save SimplePay configuration (encrypted)
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
    const { merchantId, secretKey, sandboxMode } = simplePayConfigSchema.parse(body)

    // Encrypt the keys
    const encryptedMerchantId = encrypt(merchantId)
    const encryptedSecretKey = encrypt(secretKey)

    // Save to database
    await prisma.restaurant.update({
      where: {
        id: session.user.restaurantId,
      },
      data: {
        simplePayMerchantId: encryptedMerchantId,
        simplePaySecretKey: encryptedSecretKey,
        simplePaySandboxMode: sandboxMode,
      },
    })

    return NextResponse.json({
      success: true,
      message: "SimplePay konfiguráció sikeresen mentve",
      masked: {
        merchantId: maskSecret(merchantId),
        secretKey: "****",
        sandboxMode,
      },
    })
  } catch (error) {
    console.error("Error saving SimplePay config:", error)

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
 * DELETE /api/admin/simplepay-config
 * Remove SimplePay configuration from database
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
        simplePayMerchantId: null,
        simplePaySecretKey: null,
        simplePaySandboxMode: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "SimplePay konfiguráció törölve",
    })
  } catch (error) {
    console.error("Error deleting SimplePay config:", error)
    return NextResponse.json(
      { error: "Hiba történt a törlés során" },
      { status: 500 }
    )
  }
}
