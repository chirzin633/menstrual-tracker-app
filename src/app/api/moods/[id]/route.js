import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const userId = "user-id-temporary";

    await prisma.mood.deleteMany({
      where: {
        id,
        userId,
      },
    });

    return NextResponse.json({ message: "Mood berhasil dihapus" });
  } catch (error) {
    console.error("Delete mood error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
