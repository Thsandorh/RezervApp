import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { getCurrentRestaurantId } from "@/lib/restaurant"

// GET specific staff member
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const restaurantId = await getCurrentRestaurantId()
    if (!restaurantId) {
      return new NextResponse("Restaurant not found", { status: 404 })
    }

    const { id } = await params

    const staff = await prisma.staff.findUnique({
      where: { id },
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

    if (!staff) {
      return new NextResponse("Staff member not found", { status: 404 })
    }

    // Verify staff belongs to current restaurant
    const staffWithRestaurant = await prisma.staff.findFirst({
      where: {
        id,
        restaurantId,
      },
    })

    if (!staffWithRestaurant) {
      return new NextResponse("Unauthorized access to staff member", { status: 403 })
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error("[STAFF_GET_BY_ID]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// UPDATE staff member
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
    const body = await request.json()
    const { name, email, password, role, isActive } = body

    // Verify staff belongs to current restaurant
    const existingStaff = await prisma.staff.findFirst({
      where: {
        id,
        restaurantId,
      },
    })

    if (!existingStaff) {
      return new NextResponse("Staff member not found", { status: 404 })
    }

    // If email is being changed, check if new email already exists
    if (email && email !== existingStaff.email) {
      const emailExists = await prisma.staff.findUnique({
        where: { email },
      })

      if (emailExists) {
        return new NextResponse("Email already exists", { status: 409 })
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (typeof isActive === "boolean") updateData.isActive = isActive

    // Hash password if provided
    if (password) {
      updateData.password = await hash(password, 10)
    }

    const staff = await prisma.staff.update({
      where: { id },
      data: updateData,
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
    console.error("[STAFF_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// DELETE staff member
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

    // Verify staff belongs to current restaurant
    const existingStaff = await prisma.staff.findFirst({
      where: {
        id,
        restaurantId,
      },
    })

    if (!existingStaff) {
      return new NextResponse("Staff member not found", { status: 404 })
    }

    // Prevent deleting yourself
    if (existingStaff.id === session.user.id) {
      return new NextResponse("Cannot delete your own account", { status: 400 })
    }

    await prisma.staff.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[STAFF_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
