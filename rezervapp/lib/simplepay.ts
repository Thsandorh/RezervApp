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
 */
export function generateSimplePaySignature(
  data: Record<string, any>,
  secretKey: string
): string {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(data).sort()

  // Concatenate values
  const dataString = sortedKeys
    .map((key) => {
      const value = data[key]
      if (Array.isArray(value)) {
        return value.join("")
      }
      return value
    })
    .join("")

  // Create HMAC SHA384 hash
  const signature = crypto
    .createHmac("sha384", secretKey)
    .update(dataString)
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
    sdkVersion: "SimplePay_PHP_SDK_2.0",
    methods: transaction.methods,
    total: transaction.amount,
    timeout: transaction.timeout.toISOString(),
    url: transaction.url,
    successUrl: transaction.successUrl,
    failUrl: transaction.failUrl,
    cancelUrl: transaction.cancelUrl,
    invoice: transaction.invoice,
  }

  // Generate signature
  const signature = generateSimplePaySignature(requestData, config.secretKey)

  // Make API request
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...requestData,
        signature,
      }),
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
 */
export function verifySimplePayIPN(
  data: Record<string, any>,
  receivedSignature: string,
  secretKey: string
): boolean {
  const calculatedSignature = generateSimplePaySignature(data, secretKey)
  return calculatedSignature === receivedSignature
}

/**
 * Check if SimplePay is configured
 */
export async function isSimplePayConfigured(): Promise<boolean> {
  const config = await getSimplePayConfig()
  return config !== null
}
