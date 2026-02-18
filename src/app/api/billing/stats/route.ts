import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [totalRecords, records] = await Promise.all([
      prisma.billingRecord.count(),
      prisma.billingRecord.findMany({
        select: { totalCharge: true, insurancePaid: true, patientOwes: true, status: true },
      }),
    ]);

    const totalRevenue = records.reduce((sum, r) => sum + r.totalCharge, 0);
    const totalPaid = records.reduce((sum, r) => sum + r.insurancePaid, 0);
    const outstanding = records.filter((r) => r.status === "pending" || r.status === "submitted").length;
    const denied = records.filter((r) => r.status === "denied").length;
    const denialRate = totalRecords > 0 ? (denied / totalRecords) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalPaid,
        outstanding,
        denialRate: Math.round(denialRate * 10) / 10,
        totalRecords,
        denied,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
