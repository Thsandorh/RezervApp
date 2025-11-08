import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCurrentRestaurantId } from "@/lib/restaurant"

// DELETE all bookings for current restaurant
export async function DELETE() {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const restaurantId = await getCurrentRestaurantId()
    if (!restaurantId) {
      return new NextResponse("Restaurant not found", { status: 404 })
    }

    // Delete all bookings for this restaurant
    const result = await prisma.booking.deleteMany({
      where: { restaurantId },
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count
    })
  } catch (error) {
    console.error("[DELETE_ALL_BOOKINGS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
