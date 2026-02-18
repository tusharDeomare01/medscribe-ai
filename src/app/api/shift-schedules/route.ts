import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const schedules = await prisma.shiftSchedule.findMany({
      orderBy: { shiftDate: "asc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: schedules });
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

    const schedule = await prisma.shiftSchedule.create({
      data: {
        shiftDate: new Date(body.shiftDate),
        shiftType: body.shiftType,
        department: body.department,
        assignedStaff: body.assignedStaff || [],
        predictedLoad: body.predictedLoad,
        aiOptimization: body.aiOptimization,
        status: body.status || "draft",
        createdBy: user.id,
      },
    });

    return NextResponse.json({ success: true, data: schedule }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
