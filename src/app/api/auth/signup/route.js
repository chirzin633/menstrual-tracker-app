import { hashPasword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, name, birthDate } = body;

    // Validasi input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, name wajib diisi!" },
        { status: 400 },
      );
    }

    // cek email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({
        error: "Email has been registerd",
        status: 400,
      });
    }

    // Hash password
    const hashedPassword = await hashPasword(password);

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        birthDate: birthDate ? new Date(birthDate) : null,
        profile: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        birthDate: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "User successfully created", user },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Signup error", error);
    return NextResponse.json({ error: "Server not found" }, { status: 500 });
  }
}
