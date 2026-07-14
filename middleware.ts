import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? '');

/**
 * Verifies the access_token cookie using jose (edge-compatible).
 * Returns the payload on success, or null if the token is missing/invalid/expired.
 */
async function verifyToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    // Token is forged, expired, or malformed
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const path = request.nextUrl.pathname;

  // Verify signature + expiry — not just existence
  const payload = await verifyToken(token);
  const isAuthenticated = payload !== null;

  // Protect profile and favourites routes
  if ((path.startsWith('/profile') || path.startsWith('/favourites')) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect seller dashboard
  if (path.startsWith('/sell') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect admin dashboard
  if (path.startsWith('/admin') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Prevent authenticated users from seeing the login page
  if (path.startsWith('/login') && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/favourites/:path*', '/sell/:path*', '/admin/:path*', '/login'],
};
