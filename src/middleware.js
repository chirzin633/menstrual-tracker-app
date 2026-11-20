// src/middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const protectedRoutes = [
    "/dashboard",
    "/cycles",
    "/mood-activity",
    "/profile",
  ];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isProtected && token && secret) {
    try {
      await jwtVerify(token, secret);
    } catch {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cycles/:path*",
    "/mood-activity/:path*",
    "/profile/:path*",
  ],
};
