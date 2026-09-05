// src/app/api/activities/[id]/route.js

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.mood.deleteMany({
      where: {
        id,
        userId,
      },
    });

    return NextResponse.json({ message: "Activity berhasil dihapus" });
  } catch (error) {
    console.error("Delete activity error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
