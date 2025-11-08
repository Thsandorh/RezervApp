import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Get the current authenticated staff's restaurant ID
 * @returns Restaurant ID or null if not authenticated
 */
export async function getCurrentRestaurantId(): Promise<string | null> {
  const session = await auth()

  if (!session?.user?.restaurantId) {
    return null
  }

  return session.user.restaurantId
}

/**
 * Get the current authenticated staff's full restaurant data
 * @returns Restaurant object or null if not authenticated
 */
export async function getCurrentRestaurant() {
  const restaurantId = await getCurrentRestaurantId()

  if (!restaurantId) {
    return null
  }

  return await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  })
}

/**
 * Verify that the current staff has access to a specific restaurant
 * @param restaurantId - Restaurant ID to check
 * @returns true if staff has access, false otherwise
 */
export async function verifyRestaurantAccess(restaurantId: string): Promise<boolean> {
  const currentRestaurantId = await getCurrentRestaurantId()
  return currentRestaurantId === restaurantId
}
