// src/types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    // Token & Auth
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    userId?: string;
    
    // Google Sheets
    googleSheetId?: string | null;
    
    // User with extended properties
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      
      // Multi-tenant / User Management
      role?: string;
      organizationId?: string;
      organizationName?: string;  // ADD THIS
      sheetId?: string;
      googleEmail?: string;
      accountType?: 'owner' |'admin' | 'user';  // ADD THIS
      permissions?: any;  

      branchId?: string;
      branchName?: string;
      branchCity?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    
    // Google Sheets
    googleSheetId?: string | null;
    
    // Multi-tenant / User Management
    role?: string;
    organizationId?: string;
    organizationName?: string;
    sheetId?: string;
    googleEmail?: string;
    accountType?: 'owner' |'admin' | 'user';  // ADD THIS
    permissions?: any;  // ADD THIS
    accessToken?: string;  // ADD THIS
    refreshToken?: string;  // ADD THIS

    branchId?: string;
    branchName?: string;
    branchCity?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    // Token Management
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    userId?: string;
    
    // Google Sheets
    googleSheetId?: string | null;
    
    // Multi-tenant / User Management
    id?: string;  // ADD THIS
    role?: string;
    organizationId?: string;
    organizationName?: string;  // ADD THIS
    sheetId?: string;
    googleEmail?: string;
    accountType?: 'owner' |'admin' | 'user';  // ADD THIS
    permissions?: any;  // ADD THIS

    branchId?: string;
    branchName?: string;
    branchCity?: string;
  }
}
