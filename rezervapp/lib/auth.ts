import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { incrementFailedAttempts, resetFailedAttempts, checkAccountLockout } from "@/lib/rate-limit"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Jelszó", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

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
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.restaurantId = user.restaurantId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.restaurantId = token.restaurantId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
})
