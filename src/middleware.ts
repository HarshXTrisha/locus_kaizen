import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/create',
  '/upload',
  '/results',
  '/settings',
  '/archive',
  '/quiz',
  '/teams'
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/login-simple',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
  '/test-db'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  // For Firebase authentication, we can't check auth state in middleware
  // because it requires client-side Firebase SDK. Instead, we'll let the
  // client-side components handle authentication checks and redirects.
  // This prevents infinite redirect loops.
  
  // Only handle basic redirects that don't require auth state
  if (pathname === '/login' && request.cookies.get('locus-store')?.value) {
    // If user has stored data, they might be authenticated
    // Let the client-side handle the redirect
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
