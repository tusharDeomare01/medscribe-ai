import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGemini, INSURANCE_VERIFICATION_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { patientName, providerName, policyNumber, groupNumber } = await req.json();
    if (!providerName || !policyNumber) {
      return NextResponse.json({ error: "Provider name and policy number are required" }, { status: 400 });
    }

    const ai = getGemini();

    const prompt = `${INSURANCE_VERIFICATION_PROMPT}
Patient Name: ${patientName || "N/A"}
Insurance Provider: ${providerName}
Policy Number: ${policyNumber}
Group Number: ${groupNumber || "N/A"}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const text = response.text || "";
    const result = JSON.parse(text);

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Insurance verification error:", error);
    return NextResponse.json({ error: "Failed to verify insurance" }, { status: 500 });
  }
}
