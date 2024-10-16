import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = (pathname: string) => {
  const excludedRoutes = [
    '/signIn',
    '/api/uploadthing',
    '/api/generateWorkOrderReport',
    '/api/updateWorkOrderState',
  ];
  return !excludedRoutes.some((route) => pathname.startsWith(route));
};

const isAdminRoute = (pathname: string) => {
  return pathname.startsWith('/management');
};

export default clerkMiddleware(async (auth, request) => {
  const { userId, orgSlug } = auth();
  const { pathname } = request.nextUrl;

  if (isProtectedRoute(pathname)) {
    if (!userId) {
      // User is not authenticated, redirect to /signIn
      return NextResponse.redirect(new URL('/signIn', request.url));
    }

    if (isAdminRoute(pathname)) {
      // Check if the user has the administrator role
      if (orgSlug !== 'admin') {
        // User doesn't have administrator role, redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // Proceed with the request
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
