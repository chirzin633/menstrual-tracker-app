import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password must be fill" },
        { status: 400 },
      );
    }

    // Cari user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "Email dan password salah" },
        { status: 401 },
      );
    }

    // Verifikasi password
    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "Email atau password salah" });
    }

    // return user data
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      message: "Login success",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error: ", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
