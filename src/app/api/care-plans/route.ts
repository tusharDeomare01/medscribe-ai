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

    const carePlans = await prisma.carePlan.findMany({
      where: {
        createdBy: user.id,
        ...(patientId ? { patientId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { patient: { select: { name: true, age: true, gender: true } } },
    });

    return NextResponse.json({ success: true, data: carePlans });
  } catch (error: unknown) {
    console.error("Care plans fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch care plans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, condition, goals, medications, exercises, dietPlan, patientId } =
      await req.json();

    if (!title || !condition || !patientId) {
      return NextResponse.json({ error: "Title, condition, and patient are required" }, { status: 400 });
    }

    const carePlan = await prisma.carePlan.create({
      data: {
        title,
        condition,
        goals: goals || [],
        medications: medications || [],
        exercises: exercises || [],
        dietPlan,
        patientId,
        createdBy: user.id,
      },
    });

    return NextResponse.json({ success: true, data: carePlan });
  } catch (error: unknown) {
    console.error("Care plan create error:", error);
    return NextResponse.json({ error: "Failed to create care plan" }, { status: 500 });
  }
}
