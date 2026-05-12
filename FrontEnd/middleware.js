import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = 'sistem-pos-rahasia-sekali-ini'; // Must match auth.js
const key = new TextEncoder().encode(secretKey);

export async function middleware(request) {
  const session = request.cookies.get('session')?.value;

  // Protect /pos routes
  if (request.nextUrl.pathname.startsWith('/pos')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      await jwtVerify(session, key, { algorithms: ['HS256'] });
    } catch (err) {
      // Invalid token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect / to /login if not logged in, or /pos if logged in
  if (request.nextUrl.pathname === '/') {
    if (session) {
       try {
         await jwtVerify(session, key, { algorithms: ['HS256'] });
         return NextResponse.redirect(new URL('/pos', request.url));
       } catch (err) {
         return NextResponse.redirect(new URL('/login', request.url));
       }
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/pos/:path*'],
};
