// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from './lib/types';

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

// Check if route is public
function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => path === route || path.startsWith(route + '/'));
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Allow public routes even without auth
    if (isPublicRoute(path)) {
      return NextResponse.next();
    }
    
    const userRole = token?.role as UserRole;
    
    // Admin can access everything
    if (userRole === 'admin') {
      return NextResponse.next();
    }
    
    // Role-based access control mapping
    const roleRoutes: Record<UserRole, string[]> = {
      admin: ['*'],
      sales: ['/prospects', '/leads', '/kanban'],
      survey: ['/survey', '/enquiries', '/kanban'],
      registration: ['/registration', '/kanban'],
      payment: ['/payments', '/subsidy', '/kanban'],
      quotation: ['/quotation', '/kanban'],
      liaison: ['/liaison', '/kanban'],
      bom: ['/bom', '/kanban'],
      dispatch: ['/dispatch', '/kanban'],
      installation: ['/installation', '/kanban'],
      wcr: ['/wcr', '/kanban'],
      subsidy: ['/subsidy', '/payments', '/kanban']
    };
    
    // Check if user has access to the current route
    const allowedRoutes = roleRoutes[userRole] || [];
    const hasAccess = allowedRoutes.some(route => 
      route === '*' || path.startsWith(route)
    );
    
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
