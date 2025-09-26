import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * Wrapper for `getServerSession` so that you don't need to import `authOptions` in every file.
 * This is the recommended way to access the session in Server Components with NextAuth.js v4.
 *
 * @returns {Promise<import('next-auth').Session | null>} The user's session, or `null` if not authenticated.
 */
export const getAuthSession = () => getServerSession(authOptions)
