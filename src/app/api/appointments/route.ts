import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: user.id },
      orderBy: { scheduledAt: "asc" },
      include: {
        patient: {
          select: { name: true, age: true, gender: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: appointments });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const appointment = await prisma.appointment.create({
      data: {
        patientId: body.patientId,
        doctorId: user.id,
        scheduledAt: new Date(body.scheduledAt),
        duration: body.duration || 30,
        type: body.type || "in-person",
        reason: body.reason,
        notes: body.notes,
      },
    });

    return NextResponse.json({ success: true, data: appointment }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
