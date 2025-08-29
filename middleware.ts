export { auth as middleware } from "./auth";

export const config = {
  // Protect all routes except login, API routes, static files, and images
  matcher: [
    "/((?!api|_next/static|_next/image|login|.*\\.png$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
