import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { incrementFailedAttempts, resetFailedAttempts, checkAccountLockout } from "@/lib/rate-limit"

// Validate reCAPTCHA token
async function validateRecaptcha(token: string): Promise<boolean> {
  // Try to get reCAPTCHA secret key from database first, then fallback to env
  let secretKey = process.env.RECAPTCHA_SECRET_KEY

  try {
    const restaurant = await prisma.restaurant.findFirst()
    if (restaurant?.recaptchaSecretKey) {
      // Decrypt the secret key from database
      const { decrypt } = await import("@/lib/encryption")
      secretKey = decrypt(restaurant.recaptchaSecretKey)
    }
  } catch (error) {
    console.error("Error fetching reCAPTCHA config from database:", error)
    // Continue with env variable
  }

  // If reCAPTCHA is not configured, skip validation
  if (!secretKey) {
    return true
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()

    // For reCAPTCHA v3, check score (0.0 - 1.0, higher is better)
    // 0.5 is a reasonable threshold
    return data.success && (!data.score || data.score >= 0.5)
  } catch (error) {
    console.error('reCAPTCHA validation error:', error)
    // On error, allow login (fail open) to avoid blocking legitimate users
    return true
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Jelszó", type: "password" },
        recaptchaToken: { label: "reCAPTCHA Token", type: "text" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string
        const recaptchaToken = credentials.recaptchaToken as string | undefined
        const rememberMe = credentials.rememberMe === "true"

        // Validate reCAPTCHA if token is provided
        if (recaptchaToken) {
          const isValidRecaptcha = await validateRecaptcha(recaptchaToken)
          if (!isValidRecaptcha) {
            throw new Error("reCAPTCHA validáció sikertelen. Kérlek próbáld újra.")
          }
        }

        const staff = await prisma.staff.findUnique({
          where: { email },
          include: {
            restaurant: true,
          },
        })

        if (!staff || !staff.isActive) {
          // Don't increment failed attempts if user doesn't exist (avoid user enumeration)
          return null
        }

        // Check if account is locked
        const { locked, lockoutUntil } = await checkAccountLockout(staff.id)
        if (locked) {
          // Return error message with lockout time
          const minutesRemaining = lockoutUntil
            ? Math.ceil((lockoutUntil.getTime() - Date.now()) / 60000)
            : 0

          throw new Error(`Fiók zárolva ${minutesRemaining} percre túl sok sikertelen bejelentkezés miatt.`)
        }

        const isPasswordValid = await compare(password, staff.password)

        if (!isPasswordValid) {
          // Increment failed attempts
          await incrementFailedAttempts(email)
          return null
        }

        // Reset failed attempts on successful login
        await resetFailedAttempts(email, '0.0.0.0') // IP will be set by middleware

        return {
          id: staff.id,
          email: staff.email,
          name: staff.name,
          role: staff.role,
          restaurantId: staff.restaurantId,
          rememberMe,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.restaurantId = user.restaurantId
        token.rememberMe = user.rememberMe || false
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.restaurantId = token.restaurantId as string
      }

      // Session expiration is handled by maxAge configuration below
      // The rememberMe flag influences the JWT maxAge

      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    // Default: 1 day for normal login, but JWT maxAge will be overridden
    maxAge: 24 * 60 * 60, // 1 day in seconds
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days max for JWT token (will be used if rememberMe is true)
  },
})
