import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  const roleRoutes: Record<string, string> = {
    'admin-lapangan': '/dashboard/admin-lapangan',
    'petugas-koperasi': '/dashboard/admin-koprasi',
    'dinas-pertanian': '/dashboard/dinas-pertanian',
    'kemenko-pangan': '/dashboard/kemenko-pangan',
    'petani': '/dashboard/petani',
  };

  const hasValidRole = userRole && roleRoutes[userRole];

  // 1. Jika pengguna mengakses root ('/') atau '/dashboard' persis
  if (pathname === '/' || pathname === '/dashboard' || pathname === '/dashboard/') {
    if (token && hasValidRole) {
      return NextResponse.redirect(new URL(roleRoutes[userRole], request.url));
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 2. Jika pengguna mengakses halaman auth (/auth/login, /auth/register)
  if (pathname.startsWith('/auth')) {
    // Hanya redirect ke dashboard JIKA token ADA dan role VALID
    if (token && hasValidRole) {
      return NextResponse.redirect(new URL(roleRoutes[userRole], request.url));
    }
    // Jika token tidak ada / role tidak valid, IZINKAN buka halaman auth
    return NextResponse.next(); // ✅ FIXED: Gunakan next(), BUKAN redirect('/auth/login')
  }

  // 3. Jika BELUM login tetapi mencoba mengakses halaman /dashboard/...
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 4. Validasi Role Access (Proteksi agar user tidak bisa buka dashboard role lain)
  if (token && pathname.startsWith('/dashboard/')) {
    if (hasValidRole) {
      const currentRoleFolder = pathname.split('/')[2];
      const expectedRoleFolder = roleRoutes[userRole].split('/')[2];

      if (currentRoleFolder !== expectedRoleFolder) {
        return NextResponse.redirect(new URL(roleRoutes[userRole], request.url));
      }
    } else {
      // Jika di dalam dashboard tapi role rusak, lempar balik ke login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/auth/:path*'],
};