import { NextRequest, NextResponse } from "next/server";

export function proxy(_req: NextRequest) {
  // Placeholder proxy: add logic such as auth checks or logging here.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/cases/:path*"],
};
