// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { UserRole } from './lib/types';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    const userRole = token?.role as UserRole;
    
    // Admin can access everything
    if (userRole === 'admin') {
      return NextResponse.next();
    }
    
    // Role-based access control mapping
    const roleRoutes: Record<UserRole, string[]> = {
      admin: ['*'], // All routes
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
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: [
    '/kanban/:path*',
    '/prospects/:path*',
    '/leads/:path*',
    '/registration/:path*',
    '/payments/:path*',
    '/quotation/:path*',
    '/liaison/:path*',
    '/bom/:path*',
    '/dispatch/:path*',
    '/installation/:path*',
    '/wcr/:path*',
    '/subsidy/:path*'
  ]
};
