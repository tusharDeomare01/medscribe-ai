import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const checks = await prisma.insuranceCheck.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        patient: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: checks });
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

    const check = await prisma.insuranceCheck.create({
      data: {
        patientId: body.patientId,
        providerName: body.providerName,
        policyNumber: body.policyNumber,
        groupNumber: body.groupNumber,
        status: body.status || "verified",
        verificationResult: body.verificationResult,
        eligibleServices: body.eligibleServices,
        copay: body.copay,
        deductible: body.deductible,
        verifiedAt: new Date(),
        verifiedBy: user.id,
      },
    });

    return NextResponse.json({ success: true, data: check }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
