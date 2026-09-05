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

    const deleted = await prisma.activity.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Activity tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Activity berhasil dihapus" });
  } catch (error) {
    console.error("Delete activity error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { activityType, duration, intensity, notes } = body;
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingActivity = await prisma.activity.findFirst({
      where: { id, userId },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity tidak ditemukan" },
        { status: 404 },
      );
    }

    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        activityType,
        duration: duration ?? undefined,
        intensity: intensity ?? undefined,
        notes,
      },
    });

    return NextResponse.json({
      message: "Activity berhasil diupdate",
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Update activity error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
