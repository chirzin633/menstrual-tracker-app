import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const user = "user-id-temporary";

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            birthDate: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Get profile error: ", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const userId = "user-id-temporary";

    const {
      name,
      birthDate,
      averageCycleLength,
      averagePeriodLength,
      emailNotifications,
      pushNotifications,
    } = body;

    // Update user
    if (name || birthDate) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
          birthDate: birthDate ? new Date(birthDate) : undefined,
        },
      });
    }

    // Update profile
    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        averageCycleLength: averageCycleLength || undefined,
        averagePeriodLength: averagePeriodLength || undefined,
        emailNotifications:
          emailNotifications !== undefined ? emailNotifications : undefined,
        pushNotification:
          pushNotifications !== undefined ? pushNotifications : undefined,
      },
    });

    return NextResponse.json({
      message: "Profile berhasil diupdate",
      profile,
    });
  } catch (error) {
    console.error("Update profile error: ", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
