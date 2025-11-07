import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"
import crypto from "crypto"

/**
 * SimplePay configuration
 */
export interface SimplePayConfig {
  merchantId: string
  secretKey: string
  sandboxMode?: boolean
}

/**
 * SimplePay transaction data
 */
export interface SimplePayTransaction {
  orderRef: string
  amount: number
  currency: string
  customerEmail: string
  language: string
  timeout: Date
  methods: string[] // ["CARD", "SIMPLEPAY"]
  url: string
  successUrl: string
  failUrl: string
  cancelUrl: string
  invoice?: {
    name: string
    company?: string
    country: string
    city: string
    zip: string
    address: string
  }
}

/**
 * Get SimplePay configuration from environment or database
 */
export async function getSimplePayConfig(): Promise<SimplePayConfig | null> {
  // Try environment variables first
  if (process.env.SIMPLEPAY_MERCHANT_ID && process.env.SIMPLEPAY_SECRET_KEY) {
    return {
      merchantId: process.env.SIMPLEPAY_MERCHANT_ID,
      secretKey: process.env.SIMPLEPAY_SECRET_KEY,
      sandboxMode: process.env.SIMPLEPAY_SANDBOX === "true",
    }
  }

  // Try loading from database
  try {
    const restaurant = await prisma.restaurant.findFirst({
      select: {
        simplePayMerchantId: true,
        simplePaySecretKey: true,
      },
    })

    if (restaurant?.simplePayMerchantId && restaurant?.simplePaySecretKey) {
      try {
        const merchantId = decrypt(restaurant.simplePayMerchantId)
        const secretKey = decrypt(restaurant.simplePaySecretKey)

        return {
          merchantId,
          secretKey,
          sandboxMode: false,
        }
      } catch (error) {
        console.error("Failed to decrypt SimplePay credentials:", error)
        return null
      }
    }
  } catch (error) {
    console.error("Failed to load SimplePay config from database:", error)
  }

  return null
}

/**
 * Generate SimplePay signature
 * The signature is base64-encoded HMAC SHA384 hash of the entire JSON body
 */
export function generateSimplePaySignature(
  jsonBody: string,
  secretKey: string
): string {
  // Create HMAC SHA384 hash of the entire JSON body
  const signature = crypto
    .createHmac("sha384", secretKey)
    .update(jsonBody)
    .digest("base64")

  return signature
}

/**
 * Create SimplePay payment request
 */
export async function createSimplePayPayment(
  transaction: SimplePayTransaction
): Promise<{ url: string; transactionId: string } | null> {
  const config = await getSimplePayConfig()

  if (!config) {
    throw new Error("SimplePay is not configured")
  }

  const baseUrl = config.sandboxMode
    ? "https://sandbox.simplepay.hu/payment/v2/start"
    : "https://secure.simplepay.hu/payment/v2/start"

  // Prepare request data
  const requestData = {
    salt: crypto.randomBytes(16).toString("hex"),
    merchant: config.merchantId,
    orderRef: transaction.orderRef,
    currency: transaction.currency,
    customerEmail: transaction.customerEmail,
    language: transaction.language,
    sdkVersion: "SimplePay_NodeJS_SDK_2.0",
    methods: transaction.methods,
    total: transaction.amount,
    timeout: transaction.timeout.toISOString(),
    url: transaction.url,
    successUrl: transaction.successUrl,
    failUrl: transaction.failUrl,
    cancelUrl: transaction.cancelUrl,
    invoice: transaction.invoice,
  }

  // Convert to JSON (IMPORTANT: This exact JSON will be hashed)
  const jsonBody = JSON.stringify(requestData)

  // Generate signature from the entire JSON body
  const signature = generateSimplePaySignature(jsonBody, config.secretKey)

  // Make API request with signature in header
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Accept-language": "HU",
        "Content-Type": "application/json",
        "Signature": signature, // Signature goes in header, not body!
      },
      body: jsonBody,
    })

    const result = await response.json()

    if (result.errorCodes && result.errorCodes.length > 0) {
      console.error("SimplePay error:", result.errorCodes)
      return null
    }

    return {
      url: result.paymentUrl,
      transactionId: result.transactionId,
    }
  } catch (error) {
    console.error("SimplePay API error:", error)
    return null
  }
}

/**
 * Verify SimplePay IPN (Instant Payment Notification)
 * The IPN data comes as JSON, and we need to verify the signature
 */
export function verifySimplePayIPN(
  jsonBody: string,
  receivedSignature: string,
  secretKey: string
): boolean {
  const calculatedSignature = generateSimplePaySignature(jsonBody, secretKey)
  return calculatedSignature === receivedSignature
}

/**
 * Check if SimplePay is configured
 */
export async function isSimplePayConfigured(): Promise<boolean> {
  const config = await getSimplePayConfig()
  return config !== null
}
