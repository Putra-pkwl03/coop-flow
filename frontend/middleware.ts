import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Ambil token dari cookie
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // 2. KONDISI A: Jika user SUDAH login tapi mencoba akses halaman login/register
  if (token && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard/admin-lapangan', request.url));
  }

  // 3. KONDISI B: Jika user BELUM login tapi nekat akses halaman dashboard/xxx
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};