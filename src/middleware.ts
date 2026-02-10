// src/middleware.ts - UPDATED with proper type casting
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from './lib/types';
import { canAccessPage, type AccountType } from './lib/permissions';

// Public routes that work in demo mode
const publicRoutes = [
  '/',
  '/login',
  '/onboard',
  '/leads',
  '/enquiries',
  '/survey',
  '/quotation',
  '/registration',
  '/payments',
  '/bom',
  '/dispatch',
  '/installation',
  '/liaison',
  '/wcr',
  '/subsidy',
  '/kanban',
  '/reports',
  '/unauthorized',
  '/settings',
  '/privacy',
  '/terms'
];

// Admin-only routes
const adminOnlyRoutes = [
  '/admin',
  '/admin/users',
  '/admin/roles',
  '/admin/branches',
];

// Check if route is public
function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => path === route || path.startsWith(route + '/'));
}

// Check if route is admin-only
function isAdminOnlyRoute(path: string): boolean {
  return adminOnlyRoutes.some(route => path.startsWith(route));
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Allow public routes even without auth
    if (isPublicRoute(path)) {
      return NextResponse.next();
    }
    
    const userRole = (token?.role as UserRole) || 'sales';
    // ✅ FIXED: Proper type casting with fallback
    const accountType = (token?.accountType as AccountType) || 'user';
    
    // ✅ Check admin-only routes first
    if (isAdminOnlyRoute(path)) {
      if (accountType === 'owner' || accountType === 'admin' || userRole === 'admin') {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    
    // ✅ Owner/Admin has access to ALL pages
    if (accountType === 'owner' || accountType === 'admin' || userRole === 'admin') {
      return NextResponse.next();
    }
    
    // ✅ Use centralized permission system for regular users
    const hasAccess = canAccessPage(accountType, userRole, path);
    
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes without token
        if (isPublicRoute(req.nextUrl.pathname)) {
          return true;
        }
        // Require token for protected routes
        return !!token;
      }
    }
  }
);

export const config = {
  matcher: [
    // Match all routes except static files and images
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)',
  ]
};
