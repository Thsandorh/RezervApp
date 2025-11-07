import Stripe from "stripe"

// Stripe is optional - only initialize if secret key is provided
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
      typescript: true,
    })
  : null

export const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY
