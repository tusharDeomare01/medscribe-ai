import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGemini, CLAIMS_AUDIT_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { claimData } = await req.json();
    if (!claimData) {
      return NextResponse.json({ error: "Claim data is required" }, { status: 400 });
    }

    const ai = getGemini();

    const prompt = `${CLAIMS_AUDIT_PROMPT}
${JSON.stringify(claimData)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const text = response.text || "";
    const result = JSON.parse(text);

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Claims audit error:", error);
    return NextResponse.json({ error: "Failed to audit claim" }, { status: 500 });
  }
}
