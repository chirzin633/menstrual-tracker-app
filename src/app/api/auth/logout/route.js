import { NextResponse } from "next/server";
import { removeTokenCookies } from "@/lib/auth";

export async function POST(req) {
  await removeTokenCookies();
  return NextResponse.json({ message: "Logged out successfully" });
}

export async function GET(req) {
  await removeTokenCookies();
  return NextResponse.redirect(new URL("/login", req.url));
}
