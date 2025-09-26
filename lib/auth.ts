import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Auth attempt for:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        // Check Student table first for student credentials
        const student = await (prisma as any).student.findUnique({
          where: { email: credentials.email },
        })
        
        let user: any = null
        
        if (student && student.password) {
          // Student found with password - use student credentials
          user = {
            id: student.id,
            email: student.email,
            name: `${student.firstName} ${student.lastName}`,
            password: student.password,
            role: 'STUDENT' as Role,
            school: student.school,
            isActive: true // Students in Student table are considered active
          }
        } else {
          // Check User table (for admins and users without Student records)
          user = await (prisma as any).user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              school: true,
              isActive: true
            }
          })
        }

        if (!user) {
          console.log('User not found:', credentials.email)
          return null
        }
        
        // Check if account is activated (only for STUDENT role)
        if ('isActive' in user && user.role === 'STUDENT' && user.isActive === false) {
          console.log('Student account not activated:', credentials.email)
          throw new Error('Account not activated')
        }
        
        console.log('User found:', user.email, 'Has password:', !!user.password)

        // Check if user has a password (for student accounts created through the system)
        if (user.password) {
          try {
            const isValidPassword = await bcrypt.compare(credentials.password, user.password)
            console.log('Password comparison result:', isValidPassword)
            if (!isValidPassword) {
              return null
            }
          } catch (error) {
            console.error('Bcrypt comparison error:', error)
            return null
          }
        } else {
          // Fallback for demo accounts without hashed passwords
          const validPasswords: Record<string, string> = {
            'admin@example.com': 'admin123',
            'student@example.com': 'student123',
            'proctor@example.com': 'proctor123',
          }
          
          const isValidPassword = validPasswords[credentials.email] === credentials.password
          if (!isValidPassword) {
            return null
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as Role
      }
      return session
    },
  },
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: Role
    }
  }

  interface User {
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role
  }
}