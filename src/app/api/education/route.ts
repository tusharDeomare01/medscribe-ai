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

    const content = await prisma.educationContent.findMany({
      where: {
        createdBy: user.id,
        ...(patientId ? { patientId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { patient: { select: { name: true } } },
    });

    return NextResponse.json({ success: true, data: content });
  } catch (error: unknown) {
    console.error("Education content fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { condition, title, content, simplifiedContent, category, readTime, patientId } =
      await req.json();

    if (!condition || !title || !content) {
      return NextResponse.json({ error: "Condition, title, and content are required" }, { status: 400 });
    }

    const edu = await prisma.educationContent.create({
      data: {
        condition,
        title,
        content,
        simplifiedContent: simplifiedContent || null,
        category: category || "explainer",
        readTime: readTime || null,
        patientId: patientId || null,
        createdBy: user.id,
      },
    });

    return NextResponse.json({ success: true, data: edu });
  } catch (error: unknown) {
    console.error("Education content save error:", error);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
