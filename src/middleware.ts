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
  '/unauthorized',
  '/privacy',
  '/terms',
];

const alwaysAllowedRoutes = [
  '/dashboard',
  '/kanban',
  '/settings',
  '/reports',
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
// Check if route is always allowed for any logged-in user
function isAlwaysAllowed(path: string): boolean {
  return alwaysAllowedRoutes.some(route => path === route || path.startsWith(route + '/'));
}


export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Allow public routes even without auth
    if (isPublicRoute(path)) {
      return NextResponse.next();
    }
    // Allow dashboard/kanban/settings for any logged-in user
if (isAlwaysAllowed(path)) {
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
   
  // ✅ Check custom per-user page permissions
  // Shape stored in Redis: { canView: ['/leads', '/survey'], canEdit: [...] }
  const customPerms = token?.permissions as { canView?: string[] } | null | undefined;

  // List of paths that require a page-level permission check
  const PERMISSION_PATHS = [
    '/leads', '/enquiries', '/survey', '/quotation',
    '/registration', '/payments', '/payment','/bom', '/dispatch',
    '/installation', '/liaison', '/wcr', '/subsidy',
  ];

  const matchedPath = PERMISSION_PATHS.find(
    p => path === p || path.startsWith(p + '/')
  );

  if (matchedPath) {
    // This path needs a permission — check canView array
    if (customPerms && Array.isArray(customPerms.canView) && customPerms.canView.length > 0) {
      // User has custom permissions set — enforce them
      return customPerms.canView.includes(matchedPath)
        ? NextResponse.next()
        : NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    // No custom permissions set — fall back to role-based check
    return canAccessPage(accountType, userRole, path)
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // Path not in permission map — allow
  return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (isPublicRoute(path)) return true;
        if (isAlwaysAllowed(path)) return !!token;
        return !!token;
      },
    },    
  }
);

export const config = {
  matcher: [
    // Match all routes except static files and images
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)',
  ]
};
