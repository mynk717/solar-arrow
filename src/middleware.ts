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
  '/terms',
  '/dashboard',
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
    
   // ✅ Check custom per-user page permissions first
// Shape stored in Redis: { Leads: { view: true }, Survey: { view: true }, ... }
const customPerms = token?.permissions as Record<string, { view?: boolean }> | null;
if (customPerms && Object.keys(customPerms).length > 0) {
  const PATH_TO_PERM_KEY: Record<string, string> = {
    '/leads': 'Leads',
    '/enquiries': 'Enquiries',
    '/survey': 'Survey',
    '/quotation': 'Quotation',
    '/registration': 'Registration',
    '/payments': 'Payments',
    '/bom': 'BOM',
    '/installation': 'Installation',
    '/liaison': 'Liaison',
    '/wcr': 'WCR',
    '/subsidy': 'Subsidy',
  };
  const matchedKey = Object.entries(PATH_TO_PERM_KEY).find(
    ([p]) => path === p || path.startsWith(p + '/')
  )?.[1];

  if (matchedKey) {
    if (!customPerms[matchedKey]?.view) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }
  return NextResponse.next();
}

// ✅ Fallback: role-based permissions for users without custom permissions
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
