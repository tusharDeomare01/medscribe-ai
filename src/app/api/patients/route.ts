import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const patients = await prisma.patient.findMany({
      where: { createdBy: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: patients });
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

    const patient = await prisma.patient.create({
      data: {
        name: body.name,
        age: body.age,
        gender: body.gender,
        bloodGroup: body.bloodGroup || null,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        allergies: body.allergies || [],
        currentMedications: body.currentMedications || [],
        emergencyContact: body.emergencyContact || null,
        createdBy: user.id,
      },
    });

    return NextResponse.json({ success: true, data: patient }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
