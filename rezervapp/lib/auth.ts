import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"

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

        const staff = await prisma.staff.findUnique({
          where: {
            email: credentials.email as string,
          },
          include: {
            restaurant: true,
          },
        })

        if (!staff || !staff.isActive) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          staff.password
        )

        if (!isPasswordValid) {
          return null
        }

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
