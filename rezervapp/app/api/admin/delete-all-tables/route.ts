import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCurrentRestaurantId } from "@/lib/restaurant"

// DELETE all tables for current restaurant
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

    // Delete all tables for this restaurant
    const result = await prisma.table.deleteMany({
      where: { restaurantId },
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count
    })
  } catch (error) {
    console.error("[DELETE_ALL_TABLES]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
