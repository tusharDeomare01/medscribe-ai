import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tasks = await prisma.nursingTask.findMany({
      where: { createdBy: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        patient: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: tasks });
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

    const task = await prisma.nursingTask.create({
      data: {
        type: body.type || "note",
        title: body.title,
        description: body.description,
        priority: body.priority || "normal",
        voiceInput: body.voiceInput,
        aiSummary: body.aiSummary,
        vitals: body.vitals,
        patientId: body.patientId,
        createdBy: user.id,
        dueAt: body.dueAt ? new Date(body.dueAt) : null,
      },
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
