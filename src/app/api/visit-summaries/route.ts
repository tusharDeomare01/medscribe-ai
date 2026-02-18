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

    const visits = await prisma.visitSummary.findMany({
      where: {
        doctorId: user.id,
        ...(patientId ? { patientId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { name: true, age: true, gender: true } },
        clinicalNote: { select: { id: true, rawText: true, soapNote: true } },
      },
    });

    return NextResponse.json({ success: true, data: visits });
  } catch (error: unknown) {
    console.error("Visit summaries fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { patientId, visitType, preScreening, followUpDate, clinicalNoteId } =
      await req.json();

    if (!patientId || !visitType) {
      return NextResponse.json({ error: "Patient and visit type are required" }, { status: 400 });
    }

    const visit = await prisma.visitSummary.create({
      data: {
        visitType,
        preScreening: preScreening || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        patientId,
        doctorId: user.id,
        clinicalNoteId: clinicalNoteId || null,
      },
      include: {
        patient: { select: { name: true, age: true, gender: true } },
      },
    });

    return NextResponse.json({ success: true, data: visit });
  } catch (error: unknown) {
    console.error("Visit create error:", error);
    return NextResponse.json({ error: "Failed to create visit" }, { status: 500 });
  }
}
