import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET single restaurant
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            tables: true,
            bookings: true,
            staff: true,
            guests: true,
          },
        },
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

// UPDATE restaurant
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      email,
      phone,
      address,
      city,
      postalCode,
      timeZone,
      currency,
    } = body

    // If slug is being changed, check it's unique
    if (slug) {
      const existingRestaurant = await prisma.restaurant.findFirst({
        where: {
          slug,
          NOT: { id: params.id },
        },
      })

      if (existingRestaurant) {
        return new NextResponse("Slug already exists", { status: 409 })
      }
    }

    const restaurant = await prisma.restaurant.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(city && { city }),
        ...(postalCode !== undefined && { postalCode }),
        ...(timeZone && { timeZone }),
        ...(currency && { currency }),
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
    })

    if (!restaurant) {
      return new NextResponse("Restaurant not found", { status: 404 })
    }

    // Delete restaurant (cascade will handle related records)
    await prisma.restaurant.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[RESTAURANT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
