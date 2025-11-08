import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET single restaurant
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params

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
          NOT: { id },
        },
      })

      if (existingRestaurant) {
        return new NextResponse("Slug already exists", { status: 409 })
      }
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    })

    if (!restaurant) {
      return new NextResponse("Restaurant not found", { status: 404 })
    }

    // Delete restaurant (cascade will handle related records)
    await prisma.restaurant.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[RESTAURANT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
