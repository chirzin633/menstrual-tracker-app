// src/app/api/cycles/[id]/route.js

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

const DAY_MS = 1000 * 60 * 60 * 24;

function diffDays(from, to) {
  return Math.ceil((to - from) / DAY_MS);
}

async function recalculateCycleStats(userId) {
  const cycles = await prisma.cycle.findMany({
    where: { userId },
    orderBy: { startDate: "asc" },
  });

  const gaps = cycles.slice(1).map((cycle, index) =>
    diffDays(cycles[index].startDate, cycle.startDate),
  );
  const averageCycleLength = gaps.length
    ? Math.round(gaps.reduce((total, gap) => total + gap, 0) / gaps.length)
    : null;
  const predictionLength = averageCycleLength || 28;

  const updates = cycles.map((cycle, index) => {
    const cycleLength =
      index === 0
        ? null
        : diffDays(cycles[index - 1].startDate, cycle.startDate);
    const predictedNextDate = new Date(cycle.startDate);
    predictedNextDate.setDate(predictedNextDate.getDate() + predictionLength);

    return prisma.cycle.update({
      where: { id: cycle.id },
      data: { cycleLength, predictedNextDate },
    });
  });

  await prisma.$transaction([
    ...updates,
    prisma.profile.update({
      where: { userId },
      data: { averageCycleLength },
    }),
  ]);
}

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

    await recalculateCycleStats(userId);

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

    const newStart = startDate ? new Date(startDate) : existingCycle.startDate;
    const newEnd = endDate ? new Date(endDate) : existingCycle.endDate;
    const datesChanged = Boolean(startDate || endDate);

    let periodLength = existingCycle.periodLength;

    if (datesChanged) {
      if (Number.isNaN(newStart.getTime()) || Number.isNaN(newEnd.getTime())) {
        return NextResponse.json(
          { error: "Tanggal tidak valid" },
          { status: 400 },
        );
      }

      if (newEnd < newStart) {
        return NextResponse.json(
          { error: "End date harus lebih besar atau sama dengan start date" },
          { status: 400 },
        );
      }

      const prevCycle = await prisma.cycle.findFirst({
        where: {
          userId,
          id: { not: id },
          startDate: { lt: existingCycle.startDate },
        },
        orderBy: { startDate: "desc" },
      });

      const nextCycle = await prisma.cycle.findFirst({
        where: {
          userId,
          id: { not: id },
          startDate: { gt: existingCycle.startDate },
        },
        orderBy: { startDate: "asc" },
      });

      if (prevCycle && newStart <= prevCycle.startDate) {
        return NextResponse.json(
          { error: "Start date harus setelah siklus sebelumnya" },
          { status: 400 },
        );
      }

      if (nextCycle && newStart >= nextCycle.startDate) {
        return NextResponse.json(
          { error: "Start date harus sebelum siklus berikutnya" },
          { status: 400 },
        );
      }

      if (prevCycle && prevCycle.endDate >= newStart) {
        return NextResponse.json(
          {
            error:
              "Periode tidak boleh tumpang tindih dengan siklus sebelumnya",
          },
          { status: 400 },
        );
      }

      if (nextCycle && newEnd >= nextCycle.startDate) {
        return NextResponse.json(
          {
            error:
              "Periode tidak boleh tumpang tindih dengan siklus berikutnya",
          },
          { status: 400 },
        );
      }

      periodLength = diffDays(newStart, newEnd) + 1;
    }

    await prisma.cycle.update({
      where: { id },
      data: {
        startDate: startDate ? newStart : undefined,
        endDate: endDate ? newEnd : undefined,
        periodLength,
        flowIntensity,
        symptoms: symptoms ? JSON.stringify(symptoms) : undefined,
        notes,
      },
    });

    if (datesChanged) {
      await recalculateCycleStats(userId);
    }

    const updatedCycle = await prisma.cycle.findUnique({ where: { id } });

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
