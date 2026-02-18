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

    const sessions = await prisma.triageSession.findMany({
      where: patientId ? { patientId } : {},
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { patient: { select: { name: true } } },
    });

    return NextResponse.json({ success: true, data: sessions });
  } catch (error: unknown) {
    console.error("Triage sessions fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { symptoms, conversation, severity, recommendation, triageResult, patientId } =
      await req.json();

    const session = await prisma.triageSession.create({
      data: {
        symptoms: symptoms || [],
        conversation: conversation || [],
        severity,
        recommendation,
        triageResult,
        patientId: patientId || null,
      },
    });

    return NextResponse.json({ success: true, data: session });
  } catch (error: unknown) {
    console.error("Triage session save error:", error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}
