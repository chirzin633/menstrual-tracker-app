import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET ambil semua cycle user
export async function GET(req) {
  try {
    // ambil user id dari auth
    const userId = "user-id-temporary";

    const cycles = await prisma.cycle.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ cycles });
  } catch (error) {
    console.error("Get cycles error: ", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

// POST - Buat cycle baru
export async function POST(req) {
  try {
    const body = await req.json();

    const { startDate, endDate, flowIntensity, symptoms, notes } = body;

    // TODO: Ambil userID dari auth
    const userId = "user-id-temporary";

    // Validasi
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date dan end date wajib diisi" },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Hitung period length
    const periodLength = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Ambil cycle terakhir untuk hitung cycle length
    const lastCycle = await prisma.cycle.findFirst({
      where: { userId },
      orderBy: { startDate: "desc" },
    });

    let cycleLength = null;
    if (lastCycle) {
      cycleLength = Math.ceil(
        (start - lastCycle.startDate) / (1000 * 60 * 60 * 24),
      );
    }

    // Prediksi tanggal berikutnya
    const profile = await prisma.profile.findUnique({ where: { userId } });

    const avgCycleLength = profile?.averageCycleLength || 28;
    const predictedNextDate = new Date(start);

    predictedNextDate.setDate(predictedNextDate.getDate() + avgCycleLength);

    // Buat cycle
    const cycle = await prisma.cycle.create({
      data: {
        userId,
        startDate: start,
        endDate: end,
        periodLength,
        cycleLength,
        flowIntensity,
        symptoms: symptoms ? JSON.stringify(symptoms) : null,
        notes,
        predictedNextDate,
      },
    });

    // Update average cycle length di profile
    // Ambil semua cycles untuk hitung rata-rata

    const allCycles = await prisma.cycle.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
    });

    if (allCycles.length >= 2) {
      const totalLength = allCycles.reduce((sum, c, index) => {
        if (index < allCycles.length - 1) {
          const nextCycle = allCycles[index - 1];
          const diff = Math.ceil(
            (c.startDate - nextCycle.startDate) / (1000 * 60 * 60 * 24),
          );
          return sum + diff;
        }

        return sum;
      }, 0);

      const avgLength = Math.round(totalLength / (allCycles.length - 1));

      await prisma.profile.update({
        where: { userId },
        data: { averageCycleLength: avgLength },
      });
    }

    return NextResponse.json(
      { message: "Cycle berhasil dibuat", cycle },
      { status: 201 },
    );
  } catch (error) {
    console.error("Cycle cycle error", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
