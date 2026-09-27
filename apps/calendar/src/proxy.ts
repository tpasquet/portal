import { NextResponse } from "next/server";

export default function proxy() {
  return NextResponse.next();
}

export const config = {
  // Authentication is enforced by Better Auth in Server Components and Route Handlers.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons).*)",
  ],
};
