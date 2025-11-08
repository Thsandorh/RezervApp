import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all restaurants
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const restaurants = await prisma.restaurant.findMany({
      orderBy: { createdAt: "desc" },
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
        createdAt: true,
        _count: {
          select: {
            tables: true,
            bookings: true,
            staff: true,
          },
        },
      },
    })

    return NextResponse.json(restaurants)
  } catch (error) {
    console.error("[RESTAURANTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// CREATE new restaurant
export async function POST(request: Request) {
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

    // Validate required fields
    if (!name || !slug || !email || !phone || !address || !city) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if slug is unique
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug },
    })

    if (existingRestaurant) {
      return new NextResponse("Slug already exists", { status: 409 })
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug,
        email,
        phone,
        address,
        city,
        postalCode: postalCode || "",
        timeZone: timeZone || "Europe/Budapest",
        currency: currency || "HUF",
      },
    })

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error("[RESTAURANTS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
