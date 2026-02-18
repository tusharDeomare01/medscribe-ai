import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGemini, SCHEDULE_OPTIMIZATION_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { date, department, availableStaff, predictedLoad } = await req.json();

    const ai = getGemini();

    const prompt = `${SCHEDULE_OPTIMIZATION_PROMPT}
Date: ${date || new Date().toISOString().split("T")[0]}
Department: ${department || "General"}
Available Staff: ${JSON.stringify(availableStaff || [])}
Predicted Patient Load: ${JSON.stringify(predictedLoad || {})}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const text = response.text || "";
    const result = JSON.parse(text);

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Schedule optimization error:", error);
    return NextResponse.json({ error: "Failed to optimize schedule" }, { status: 500 });
  }
}
