import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//TODO CHECK IF THE USER IS ALLOWED TO ACCES THE PAGE SPECIALLY WITH ADMINISTRATION STUFF

const isProtectedRoute = (pathname: string) => {
  const excludedRoutes = ["/signIn"]; // Include other auth-related routes if necessary

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
