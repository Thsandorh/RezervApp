import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/encryption"
import { getCurrentRestaurantId } from "@/lib/restaurant"

// GET restaurant details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        timeZone: true,
        currency: true,
        openingHours: true,
        slotDuration: true,
        maxAdvanceDays: true,
        minAdvanceHours: true,
        recaptchaSiteKey: true,
        // Don't return encrypted fields directly
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!restaurant) {
      return new NextResponse("Restaurant not found", { status: 404 })
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error("[RESTAURANT_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// UPDATE restaurant settings
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "OWNER") {
      return new NextResponse("Unauthorized - OWNER role required", { status: 403 })
    }

    const restaurantId = await getCurrentRestaurantId()
    if (!restaurantId) {
      return new NextResponse("Restaurant not found", { status: 404 })
    }

    const { id } = await params

    // Verify restaurant belongs to current user
    if (id !== restaurantId) {
      return new NextResponse("Unauthorized access to restaurant", { status: 403 })
    }

    const body = await request.json()

    // Prepare update data
    const updateData: any = {}

    // Handle basic fields
    if (body.name !== undefined) updateData.name = body.name
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.email !== undefined) updateData.email = body.email
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.address !== undefined) updateData.address = body.address
    if (body.city !== undefined) updateData.city = body.city
    if (body.postalCode !== undefined) updateData.postalCode = body.postalCode
    if (body.timeZone !== undefined) updateData.timeZone = body.timeZone
    if (body.currency !== undefined) updateData.currency = body.currency
    if (body.openingHours !== undefined) updateData.openingHours = body.openingHours
    if (body.slotDuration !== undefined) updateData.slotDuration = body.slotDuration
    if (body.maxAdvanceDays !== undefined) updateData.maxAdvanceDays = body.maxAdvanceDays
    if (body.minAdvanceHours !== undefined) updateData.minAdvanceHours = body.minAdvanceHours

    // Handle Stripe keys (encrypted)
    if (body.stripeSecretKey !== undefined) {
      updateData.stripeSecretKey = body.stripeSecretKey ? encrypt(body.stripeSecretKey) : null
    }
    if (body.stripeWebhookSecret !== undefined) {
      updateData.stripeWebhookSecret = body.stripeWebhookSecret ? encrypt(body.stripeWebhookSecret) : null
    }

    // Handle SimplePay keys (encrypted)
    if (body.simplePayMerchantId !== undefined) {
      updateData.simplePayMerchantId = body.simplePayMerchantId ? encrypt(body.simplePayMerchantId) : null
    }
    if (body.simplePaySecretKey !== undefined) {
      updateData.simplePaySecretKey = body.simplePaySecretKey ? encrypt(body.simplePaySecretKey) : null
    }

    // Handle reCAPTCHA keys
    if (body.recaptchaSiteKey !== undefined) {
      updateData.recaptchaSiteKey = body.recaptchaSiteKey || null
    }
    if (body.recaptchaSecretKey !== undefined) {
      updateData.recaptchaSecretKey = body.recaptchaSecretKey ? encrypt(body.recaptchaSecretKey) : null
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        timeZone: true,
        currency: true,
        openingHours: true,
        slotDuration: true,
        maxAdvanceDays: true,
        minAdvanceHours: true,
        recaptchaSiteKey: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error("[RESTAURANT_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// DELETE restaurant
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "OWNER") {
      return new NextResponse("Unauthorized - OWNER role required", { status: 403 })
    }

    const restaurantId = await getCurrentRestaurantId()
    if (!restaurantId) {
      return new NextResponse("Restaurant not found", { status: 404 })
    }

    const { id } = await params

    // Verify restaurant belongs to current user
    if (id !== restaurantId) {
      return new NextResponse("Unauthorized access to restaurant", { status: 403 })
    }

    await prisma.restaurant.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[RESTAURANT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
