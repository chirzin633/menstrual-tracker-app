// src/app/api/cycles/[id]/route.js

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

    const deleted = await prisma.cycle.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Cycle tidak ditemukan" },
        { status: 404 },
      );
    }

    if (deleted.count > 0) {
      const allCycles = await prisma.cycle.findMany({
        where: { userId },
        orderBy: { startDate: "desc" },
      });

      if (allCycles.length >= 2) {
        let totalLength = 0;
        for (let i = 0; i < allCycles.length - 1; i++) {
          const diff = Math.ceil(
            (allCycles[i].startDate - allCycles[i + 1].startDate) /
              (1000 * 60 * 60 * 24),
          );

          totalLength += diff;
        }

        const avgLength = Math.round(totalLength / (allCycles.length - 1));
        await prisma.profile.update({
          where: { userId },
          data: { averageCycleLength: avgLength },
        });
      } else {
        await prisma.profile.update({
          where: { userId },
          data: { averageCycleLength: null },
        });
      }
    }

    return NextResponse.json({ message: "Cycle berhasil dihapus!" });
  } catch (error) {
    console.error("Delete cycle error:", error);
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
    const { startDate, endDate, flowIntensity, symptoms, notes } = body;
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    let periodLength = existingCycle.periodLength;
    let cycleLength = existingCycle.cycleLength;
    let predictedNextDate = existingCycle.predictedNextDate;

    const newStart = startDate ? new Date(startDate) : existingCycle.startDate;
    const newEnd = endDate ? new Date(endDate) : existingCycle.endDate;

    // hitung ulang periodLength jika tanggal berubah
    if (startDate || endDate) {
      if (newEnd < newStart) {
        return NextResponse.json(
          { error: "End date harus lebih besar atau sama dengan start date" },
          { status: 400 },
        );
      }
      periodLength = Math.ceil((newEnd - newStart) / (1000 * 60 * 60 * 24)) + 1;

      // hitung ulang cycleLength dari siklus sebelumnya
      const prevCycle = await prisma.cycle.findFirst({
        where: { userId, startDate: { lt: newStart }, id: { not: id } },
        orderBy: { startDate: "desc" },
      });

      if (prevCycle) {
        cycleLength = Math.ceil(
          (newStart - prevCycle.startDate) / (1000 * 60 * 60 * 24),
        );
      }

      // hitung ulang predictedNextDate
      const profile = await prisma.profile.findUnique({ where: { userId } });
      const avgCycleLength = profile?.averageCycleLength || 28;
      predictedNextDate = new Date(newStart);
      predictedNextDate.setDate(predictedNextDate.getDate() + avgCycleLength);
    }

    const updatedCycle = await prisma.cycle.update({
      where: { id },
      data: {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        periodLength,
        cycleLength,
        predictedNextDate,
        flowIntensity,
        symptoms: symptoms ? JSON.stringify(symptoms) : undefined,
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
}
