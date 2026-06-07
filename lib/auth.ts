import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
    error:  '/auth/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null

        return {
          id:             user.id,
          email:          user.email,
          name:           user.name,
          role:           user.role,
          approvalStatus: user.approvalStatus,
        }
      },
    }),

    ...(process.env.AZURE_AD_CLIENT_ID ? [
      MicrosoftEntraID({
        clientId:     process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        tenantId:     process.env.AZURE_AD_TENANT_ID!,
      })
    ] : []),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id             = user.id
        token.role           = (user as any).role
        token.approvalStatus = (user as any).approvalStatus
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id             = token.id as string
        session.user.role           = token.role as string
        session.user.approvalStatus = token.approvalStatus as string
      }
      return session
    },
  },
})
