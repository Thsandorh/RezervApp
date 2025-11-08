import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { getCurrentRestaurantId } from "@/lib/restaurant"

// GET all staff for current restaurant
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const restaurantId = await getCurrentRestaurantId()
    if (!restaurantId) {
      return new NextResponse("Restaurant not found", { status: 404 })
    }

    const staff = await prisma.staff.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error("[STAFF_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// CREATE new staff member
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "OWNER") {
      return new NextResponse("Unauthorized - OWNER role required", { status: 403 })
    }

    const restaurantId = await getCurrentRestaurantId()
    if (!restaurantId) {
      return new NextResponse("Restaurant not found", { status: 404 })
    }

    const body = await request.json()
    const { name, email, password, role } = body

    // Validate required fields
    if (!name || !email || !password) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if email already exists
    const existingStaff = await prisma.staff.findUnique({
      where: { email },
    })

    if (existingStaff) {
      return new NextResponse("Email already exists", { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    const staff = await prisma.staff.create({
      data: {
        restaurantId,
        name,
        email,
        password: hashedPassword,
        role: role || "STAFF",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error("[STAFF_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
