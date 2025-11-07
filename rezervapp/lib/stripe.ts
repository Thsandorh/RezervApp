import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"

// Cache for Stripe instance
let stripeInstance: Stripe | null = null
let stripeChecked = false

/**
 * Get Stripe instance with keys from environment or database
 * Priority: .env > database
 */
export async function getStripeInstance(): Promise<Stripe | null> {
  // Return cached instance if already initialized
  if (stripeInstance) {
    return stripeInstance
  }

  // If already checked and no Stripe config found, return null
  if (stripeChecked && !stripeInstance) {
    return null
  }

  // Try environment variables first (priority)
  if (process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
      typescript: true,
    })
    stripeChecked = true
    return stripeInstance
  }

  // Try loading from database
  try {
    const restaurant = await prisma.restaurant.findFirst({
      select: {
        stripeSecretKey: true,
      },
    })

    if (restaurant?.stripeSecretKey) {
      try {
        const decryptedKey = decrypt(restaurant.stripeSecretKey)

        stripeInstance = new Stripe(decryptedKey, {
          apiVersion: "2025-10-29.clover",
          typescript: true,
        })
        stripeChecked = true
        return stripeInstance
      } catch (error) {
        console.error("Failed to decrypt Stripe key from database:", error)
        stripeChecked = true
        return null
      }
    }
  } catch (error) {
    console.error("Failed to load Stripe config from database:", error)
  }

  stripeChecked = true
  return null
}

/**
 * Check if Stripe is configured (sync check)
 * Only checks environment variables synchronously
 */
export const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY

/**
 * Get Stripe webhook secret from environment or database
 */
export async function getStripeWebhookSecret(): Promise<string | null> {
  // Try environment variable first
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    return process.env.STRIPE_WEBHOOK_SECRET
  }

  // Try loading from database
  try {
    const restaurant = await prisma.restaurant.findFirst({
      select: {
        stripeWebhookSecret: true,
      },
    })

    if (restaurant?.stripeWebhookSecret) {
      try {
        return decrypt(restaurant.stripeWebhookSecret)
      } catch (error) {
        console.error("Failed to decrypt Stripe webhook secret from database:", error)
        return null
      }
    }
  } catch (error) {
    console.error("Failed to load Stripe webhook secret from database:", error)
  }

  return null
}

// Legacy export for backwards compatibility (will be null if no env var)
// Use getStripeInstance() instead for database support
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
      typescript: true,
    })
  : null
