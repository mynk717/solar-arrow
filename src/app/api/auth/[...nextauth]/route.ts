// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions, User, Account, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { redis } from '@/lib/redis';

export const authOptions: AuthOptions = {
  providers: [
    // Google OAuth (for ADMINS only)
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

    // Email/Password (for USERS only - not admins)
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

        // Look up user by email (NOT admin)
        const userIdKey = await redis.get(`user:email:${credentials.email}`);
        if (!userIdKey) {
          return null;
        }

        const user = await redis.get(`user:${userIdKey}:info`) as any;
        
        if (!user || !user.isActive || !user.passwordHash) {
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        // Get organization
        const org = await redis.get(`org:${user.organizationId}:info`) as any;
        if (!org) {
          return null;
        }

        // Get OAuth tokens from ANY admin in this org
        const orgAdmins = await redis.smembers(`org:${user.organizationId}:admins`);
        let accessToken = null;
        let refreshToken = null;
        
        for (const adminEmail of orgAdmins) {
          const tokens = await redis.get(`org:${user.organizationId}:oauth:${adminEmail}`) as any;
          if (tokens?.accessToken) {
            accessToken = tokens.accessToken;
            refreshToken = tokens.refreshToken;
            break;
          }
        }

        // Update last login
        await redis.set(`user:${userIdKey}:info`, {
          ...user,
          lastLogin: new Date().toISOString(),
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: org.name,
          sheetId: org.sheetId,
          accountType: 'user', // Important: mark as user, not admin
          accessToken,
          refreshToken
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
        // Check if admin exists
        let admin = await redis.get(`admin:${user.email}:info`) as any;
        
        if (!admin) {
          // NEW ADMIN - Auto-create organization
          const orgId = `org_${nanoid(12)}`;
          const orgName = `${user.name?.split(' ')[0] || 'My'} Organization`;
          
          // Create organization
          await redis.set(`org:${orgId}:info`, {
            id: orgId,
            name: orgName,
            domain: user.email.split('@')[1] || '',
            sheetId: '',
            createdAt: new Date().toISOString(),
            isActive: true,
          });
          
          // Create owner admin
          await redis.set(`admin:${user.email}:info`, {
            email: user.email,
            name: user.name,
            organizationId: orgId,
            role: 'owner',
            permissions: {
              manageUsers: true,
              manageDepartments: true,
              manageAdmins: true,
              manageSettings: true,
              viewReports: true,
            },
            isActive: true,
            createdAt: new Date().toISOString(),
          });
          
          await redis.sadd(`org:${orgId}:admins`, user.email);
          
          admin = { organizationId: orgId, role: 'owner' };
        }

        if (!admin.isActive) {
          return false; // Block inactive admins
        }

        // Save/update admin's OAuth tokens
        await redis.set(`org:${admin.organizationId}:oauth:${user.email}`, {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          updatedAt: new Date().toISOString(),
        });

        return true;
      }

      // Credentials login - handled in authorize()
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.organizationId = user.organizationId
        token.sheetId = user.sheetId
        token.accountType = user.accountType ?? 'admin'
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
      }
      
      if (account?.provider === 'google') {
        token.accessToken = account.access_token!
        token.refreshToken = account.refresh_token!
        
        // Fetch admin details
        const admin = await redis.get(`admin:${user.email}:info`) as any
        token.role = admin?.role ?? 'owner'
        token.organizationId = admin?.organizationId
        token.accountType = 'admin'
        token.permissions = admin?.permissions
        
        // Get org details
        const org = await redis.get(`org:${admin.organizationId}:info`) as any
        token.sheetId = org?.sheetId
        token.organizationName = org?.name
        
        // ✅ ADD THIS - Update Redis (mirrors signIn callback logic)
        if (admin?.organizationId && user?.email) {
          await redis.set(`org:${admin.organizationId}:oauth:${user.email}`, {
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at,
            updatedAt: new Date().toISOString(),
          });
          console.log('✅ JWT callback updated Redis tokens for:', user.email);
        }
      }
      
      return token
    },
    
    

    async session({ session, token }: { 
      session: Session; 
      token: JWT 
    }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
        session.user.sheetId = token.sheetId as string;
        session.user.accountType = token.accountType as 'admin' | 'user';
        session.user.permissions = token.permissions as any;
        session.user.organizationName = token.organizationName as string;
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
