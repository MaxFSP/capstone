import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Custom function to check if the route should be protected
const isProtectedRoute = (pathname: string) => {
  const protectedRoutes = ["/"];
  const excludedRoutes = ["/signIn"];

  // Check if the pathname starts with any excluded route
  for (const route of excludedRoutes) {
    if (pathname.startsWith(route)) {
      return false;
    }
  }

  // Check if the pathname starts with any protected route
  for (const route of protectedRoutes) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return true;
    }
  }

  return false;
};

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  if (isProtectedRoute(pathname)) {
    const { userId } = auth();

    if (!userId) {
      // User is not authenticated, redirect to /signIn
      return NextResponse.redirect(new URL("/signIn", request.url));
    }
  }

  // Proceed with the request
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
