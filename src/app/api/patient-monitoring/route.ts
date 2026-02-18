import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    const records = await prisma.patientMonitoring.findMany({
      where: patientId ? { patientId } : { recordedBy: user.id },
      orderBy: { recordedAt: "desc" },
      take: 30,
      include: {
        patient: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: records });
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

    const record = await prisma.patientMonitoring.create({
      data: {
        patientId: body.patientId,
        heartRate: body.heartRate,
        systolic: body.systolic,
        diastolic: body.diastolic,
        temperature: body.temperature,
        spo2: body.spo2,
        respRate: body.respRate,
        painLevel: body.painLevel,
        alertLevel: body.alertLevel,
        alertMessage: body.alertMessage,
        aiAnalysis: body.aiAnalysis,
        recordedBy: user.id,
      },
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
