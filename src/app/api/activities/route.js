// src/app/api/activities/route.js

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req) {
  try {
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Get activities error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { activityType, duration, intensity, notes } = body;
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!activityType) {
      return NextResponse.json(
        { error: "Activity type wajib diisi" },
        { status: 400 },
      );
    }

    const newActivity = await prisma.activity.create({
      data: {
        userId,
        activityType,
        duration: duration || 0,
        intensity: intensity || 0,
        notes,
      },
    });

    return NextResponse.json(
      {
        message: "Activity berhasil dicatat",
        activity: newActivity,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create activity error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
