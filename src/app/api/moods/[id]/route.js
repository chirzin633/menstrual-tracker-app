// src/app/api/moods/[id]/route.js

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleted = await prisma.mood.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Mood tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Mood berhasil dihapus" });
  } catch (error) {
    console.error("Delete mood error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { mood, energyLevel, stressLevel, notes } = body;
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingMood = await prisma.mood.findFirst({
      where: { id, userId },
    });

    if (!existingMood) {
      return NextResponse.json(
        { error: "Mood tidak ditemukan" },
        { status: 404 },
      );
    }

    const updatedMood = await prisma.mood.update({
      where: { id },
      data: {
        mood,
        energyLevel: energyLevel ?? undefined,
        stressLevel: stressLevel ?? undefined,
        notes,
      },
    });

    return NextResponse.json({
      message: "Mood berhasil diupdate",
      mood: updatedMood,
    });
  } catch (error) {
    console.error("Update mood error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
