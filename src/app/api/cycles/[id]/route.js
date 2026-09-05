// src/app/api/cycles/[id]/route.js

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

    await prisma.cycle.deleteMany({
      where: {
        id,
        userId,
      },
    });

    return NextResponse.json({ message: "Cycle berhasil dihapus!" });
  } catch (error) {
    console.error("Delete cycle error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {}
try {
  const { id } = params;
  const body = await req.json();
  const { startDate, endDate, flowIntensity, symptoms, notes } = body;
  const userId = "user-id-temporary";

  // Validasi ownership
  const existingCycle = await prisma.cycle.findFirst({
    where: { id, userId },
  });

  if (!existingCycle) {
    return NextResponse.json(
      { error: "Cycle tidak ditemukan" },
      { status: 404 },
    );
  }

  const updatedCycle = await prisma.cycle.update({
    where: { id },
    data: {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      flowIntensity,
      symptoms: symptoms ? JSON.stringify(symptoms) : null,
      notes,
    },
  });

  return NextResponse.json({
    message: "Cycle berhasil diupdate",
    cycle: updatedCycle,
  });
} catch (error) {
  console.error("Update cycle error:", error);
  return NextResponse.json(
    { error: "Terjadi kesalahan pada server" },
    { status: 500 },
  );
}
