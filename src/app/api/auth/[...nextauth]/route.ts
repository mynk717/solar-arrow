// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions, User, Account, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { redis } from '@/lib/redis';

export const authOptions: AuthOptions = {
  providers: [
    // Google OAuth (for admin)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email', 
            'profile',
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file'
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    }),

    // Email/Password (for team members)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Get user from Redis
        const user = await redis.get(`user:${credentials.email}:info`) as any;
        
        if (!user || !user.isActive) {
          return null;
        }

        // Get organization
        const org = await redis.get(`org:${user.organizationId}:info`) as any;
        
        if (!org) {
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        // Get organization's Google access token
        const orgTokens = await redis.get(`org:${user.organizationId}:tokens`) as any;

        return {
          id: user.email,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: org.name,
          sheetId: org.sheetId,
          googleEmail: org.googleEmail,
          // Use organization's tokens
          accessToken: orgTokens?.accessToken,
          refreshToken: orgTokens?.refreshToken
        } as any;
      }
    })
  ],

  callbacks: {
    async signIn({ user, account, profile }: { 
      user: User | any; 
      account: Account | null; 
      profile?: any 
    }) {
      if (account?.provider === 'google') {
        // Check if user's Google email is an admin for any organization
        const orgs = await redis.keys('org:*:info');
        
        let foundOrg = null;
        for (const orgKey of orgs) {
          const org = await redis.get(orgKey) as any;
          if (org?.googleEmail === user.email) {
            foundOrg = org;
            break;
          }
        }

        if (!foundOrg) {
          // Not an authorized admin
          return false;
        }

        // Save Google tokens to Redis (shared by all organization users)
        await redis.set(`org:${foundOrg.id}:tokens`, {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          updatedAt: new Date().toISOString(),
          updatedBy: user.email
        });

        return true;
      }

      return true;
    },

    async jwt({ token, user, account }: { 
      token: JWT; 
      user?: User | any; 
      account?: Account | null 
    }) {
      if (user) {
        token.role = user.role || 'admin'; // Google users are admins
        token.organizationId = user.organizationId;
        token.sheetId = user.sheetId;
        token.googleEmail = user.googleEmail || user.email;
        
        if (account?.provider === 'google') {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          
          // Find organization for Google user
          const orgs = await redis.keys('org:*:info');
          for (const orgKey of orgs) {
            const org = await redis.get(orgKey) as any;
            if (org?.googleEmail === user.email) {
              token.organizationId = org.id;
              token.sheetId = org.sheetId;
              break;
            }
          }
        } else {
          // Credentials provider - use shared tokens
          token.accessToken = user.accessToken;
          token.refreshToken = user.refreshToken;
        }
      }
      
      return token;
    },

    async session({ session, token }: { 
      session: Session; 
      token: JWT 
    }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
        session.user.sheetId = token.sheetId as string;
        session.user.googleEmail = token.googleEmail as string;
      }
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      
      return session;
    }
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
