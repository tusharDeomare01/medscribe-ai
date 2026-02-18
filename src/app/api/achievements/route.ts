import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    const achievements = await prisma.achievement.findMany({
      where: { patientId },
      orderBy: { earnedAt: "desc" },
    });

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { gamificationPoints: true, streakDays: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        achievements,
        points: patient?.gamificationPoints || 0,
        streakDays: patient?.streakDays || 0,
      },
    });
  } catch (error: unknown) {
    console.error("Achievements fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { patientId, type, title, description, icon, points } = await req.json();

    if (!patientId || !type || !title) {
      return NextResponse.json({ error: "Patient, type, and title are required" }, { status: 400 });
    }

    const [achievement] = await prisma.$transaction([
      prisma.achievement.create({
        data: {
          type,
          title,
          description: description || "",
          icon: icon || "🏆",
          points: points || 0,
          patientId,
        },
      }),
      prisma.patient.update({
        where: { id: patientId },
        data: { gamificationPoints: { increment: points || 0 } },
      }),
    ]);

    return NextResponse.json({ success: true, data: achievement });
  } catch (error: unknown) {
    console.error("Achievement create error:", error);
    return NextResponse.json({ error: "Failed to create achievement" }, { status: 500 });
  }
}
