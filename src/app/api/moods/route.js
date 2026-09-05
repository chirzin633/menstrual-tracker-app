// src/app/api/moods/route.js

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req) {
  try {
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const moods = await prisma.mood.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ moods });
  } catch (error) {
    console.error("Get moods error: ", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { mood, energyLevel, stressLevel, notes } = body;
    const userId = "user-id-temporary";

    if (!mood) {
      return NextResponse.json({ error: "Mood wajib diisi!" }, { status: 400 });
    }

    const newMood = await prisma.mood.create({
      data: {
        userId,
        mood,
        energyLevel: energyLevel || 5,
        stressLevel: stressLevel || 5,
        notes,
      },
    });

    return NextResponse.json(
      {
        message: "Mood berhasil dicatat",
        mood: newMood,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create mood error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
