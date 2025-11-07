import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { encrypt, decrypt } from "@/lib/encryption"
import { z } from "zod"

const simplePayConfigSchema = z.object({
  restaurantId: z.string(),
  merchantId: z.string().min(1),
  secretKey: z.string().min(1),
})

// POST - Save SimplePay configuration
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { restaurantId, merchantId, secretKey } = simplePayConfigSchema.parse(body)

    // Skip encryption if it's the masked value (user didn't change it)
    const shouldEncryptSecret = !secretKey.includes("•")

    // Encrypt sensitive data
    const encryptedMerchantId = encrypt(merchantId)
    const encryptedSecretKey = shouldEncryptSecret
      ? encrypt(secretKey)
      : (await prisma.restaurant.findUnique({
          where: { id: restaurantId },
          select: { simplePaySecretKey: true },
        }))?.simplePaySecretKey

    if (!encryptedSecretKey) {
      return NextResponse.json(
        { error: "Secret key megadása kötelező" },
        { status: 400 }
      )
    }

    // Update restaurant with SimplePay config
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        simplePayMerchantId: encryptedMerchantId,
        simplePaySecretKey: encryptedSecretKey,
      },
    })

    return NextResponse.json({
      success: true,
      message: "SimplePay konfiguráció mentve",
    })
  } catch (error) {
    console.error("SimplePay config save error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Hibás adatok", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Hiba történt a konfiguráció mentésekor" },
      { status: 500 }
    )
  }
}

// DELETE - Remove SimplePay configuration
export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { restaurantId } = z.object({ restaurantId: z.string() }).parse(body)

    // Remove SimplePay config
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        simplePayMerchantId: null,
        simplePaySecretKey: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "SimplePay konfiguráció törölve",
    })
  } catch (error) {
    console.error("SimplePay config delete error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Hibás adatok", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Hiba történt a konfiguráció törlésekor" },
      { status: 500 }
    )
  }
}

// GET - Get SimplePay configuration status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get("restaurantId")

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID kötelező" },
        { status: 400 }
      )
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        simplePayMerchantId: true,
        simplePaySecretKey: true,
      },
    })

    if (!restaurant) {
      return NextResponse.json({ error: "Étterem nem található" }, { status: 404 })
    }

    const isConfigured = !!(restaurant.simplePayMerchantId && restaurant.simplePaySecretKey)

    let merchantId = ""
    if (restaurant.simplePayMerchantId) {
      try {
        merchantId = decrypt(restaurant.simplePayMerchantId)
      } catch (error) {
        console.error("Failed to decrypt merchant ID:", error)
      }
    }

    return NextResponse.json({
      isConfigured,
      merchantId: merchantId || undefined,
      // Don't return the secret key for security
    })
  } catch (error) {
    console.error("SimplePay config get error:", error)

    return NextResponse.json(
      { error: "Hiba történt a konfiguráció lekérésekor" },
      { status: 500 }
    )
  }
}
