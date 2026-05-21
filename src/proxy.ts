import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-IRIS-Route", req.nextUrl.pathname);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cases/:path*",
    "/operations/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/resident/:path*",
    "/bpat-officers/:path*",
  ],
};
