import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the user ID to the token right after signin
      if (account && user) {
        token.userId = user.id
      }

      // If we have a userId, fetch the user's role
      if (token.userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId },
          select: { role: true },
        })

        if (dbUser) {
          token.role = dbUser.role || 'FREE'
        }
      }

      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token.userId) {
        // Fetch user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId },
          select: {
            id: true,
            role: true,
            paidUntil: true,
            image: true,
            createdAt: true,
          },
        })

        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role || 'FREE'
          session.user.paidUntil = dbUser.paidUntil
          session.user.image = dbUser.image
          session.user.createdAt = dbUser.createdAt
        }
      }

      return session
    },
    async signIn({ user, account, profile }) {
      // Let the adapter handle user creation, just ensure role is set
      if (account?.provider === 'google') {
        // Check if user exists and set role if needed
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        if (existingUser && !existingUser.role) {
          // Update existing user with FREE role if not set
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { role: 'FREE' },
          })
        }
      }

      return true
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
