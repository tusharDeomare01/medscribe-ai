import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGemini, CARE_PLAN_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { condition, patientInfo } = await req.json();
    if (!condition) {
      return NextResponse.json({ error: "Condition is required" }, { status: 400 });
    }

    const ai = getGemini();

    const prompt = `${CARE_PLAN_PROMPT}
Condition: ${condition}
Patient Details: ${JSON.stringify(patientInfo || {})}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const text = response.text || "";
    const carePlan = JSON.parse(text);

    return NextResponse.json({ success: true, data: carePlan });
  } catch (error: unknown) {
    console.error("Care plan generation error:", error);
    return NextResponse.json({ error: "Failed to generate care plan" }, { status: 500 });
  }
}
