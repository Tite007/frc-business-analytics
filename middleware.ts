import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CMS route confusion - redirect CSM to CMS
  if (pathname === "/CSM" || pathname === "/csm") {
    return NextResponse.redirect(new URL("/cms", request.url));
  }

  // Handle reserved routes that might conflict with company tickers
  const reservedRoutes = ["cms", "api", "login", "companies", "unauthorized"];
  const pathSegment = pathname.split("/")[1]?.toLowerCase();

  if (reservedRoutes.includes(pathSegment)) {
    // For CMS routes, check if user is authenticated on client side
    if (pathSegment === "cms") {
      // We'll let the client-side ProtectedRoute handle this
      // since we don't have access to our custom auth context in middleware
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  // For any single-segment paths that might be company tickers, let them proceed
  // The company page will handle invalid tickers gracefully
  return NextResponse.next();
}

export const config = {
  // Protect all routes except login, unauthorized, API routes, static files, and images
  matcher: [
    "/((?!api|_next/static|_next/image|login|unauthorized|.*\\.png$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
