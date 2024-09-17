import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = (pathname: string) => {
  const excludedRoutes = ["/signIn", "/api/uploadthing", "/api/generateWorkOrderReport"]; // Include other auth-related routes if necessary

  // Check if the pathname starts with any excluded route
  for (const route of excludedRoutes) {
    if (pathname.startsWith(route)) {
      return false;
    }
  }

  // All other routes are protected
  return true;
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
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
