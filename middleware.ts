import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const path = request.nextUrl.pathname;

  // Protect profile and favourites routes
  if ((path.startsWith('/profile') || path.startsWith('/favourites')) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // To protect paths by role effectively, one approach is having a /api/auth/me or verify endpoint.
  // We can't easily decode JWT without a library or using authStore here because middleware runs on Edge.
  // For basic protection, if they want to go to /sell and have no token, redirect.
  // Deeper role validation can be done inside the component or layout.
  if (path.startsWith('/sell') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (path.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Prevent logged in users from seeing login
  if (path.startsWith('/login') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/favourites/:path*', '/sell/:path*', '/admin/:path*', '/login'],
};
