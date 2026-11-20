import { NextResponse } from "next/server";
import { getUserIdFromRequest, removeTokenCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const userId = await getUserIdFromRequest(req);

    if (userId) {
      const token = req.cookies.get("token")?.value;

      if (token) {
        await prisma.session.deleteMany({
          where: { token },
        });
      }
    }
  } catch (error) {
    console.error("Logout session cleanup error: ", error);
  }

  await removeTokenCookies();
  return NextResponse.json({ message: "Logged out successfully" });
}

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (token) {
      await prisma.session.deleteMany({ where: { token } });
    }
  } catch (error) {
    console.error("Logout session cleanup error: ", error);
  }

  await removeTokenCookies();
  return NextResponse.redirect(new URL("/login", req.url));
}
