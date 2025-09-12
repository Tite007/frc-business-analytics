import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CMS route confusion - redirect CSM to CMS
  if (pathname === "/CSM" || pathname === "/csm") {
    return NextResponse.redirect(new URL("/cms", request.url));
  }

  // Let everything else pass through - authentication is handled by client-side components
  return NextResponse.next();
}

export const config = {
  // Only run middleware on specific routes that need it
  matcher: [
    "/CSM",
    "/csm",
  ],
};
