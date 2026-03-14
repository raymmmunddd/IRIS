import { NextRequest, NextResponse } from "next/server";

export function middleware(_req: NextRequest) {
  // Placeholder middleware: add logic such as auth checks or logging here
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/cases/:path*"],
};
