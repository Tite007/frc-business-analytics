export { auth as middleware } from "./auth";

export const config = {
  // Protect all routes except login, unauthorized, API routes, static files, and images
  matcher: [
    "/((?!api|_next/static|_next/image|login|unauthorized|.*\\.png$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
