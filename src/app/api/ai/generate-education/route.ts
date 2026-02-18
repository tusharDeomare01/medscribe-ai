import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGemini, EDUCATION_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { condition } = await req.json();
    if (!condition) {
      return NextResponse.json({ error: "Condition is required" }, { status: 400 });
    }

    const ai = getGemini();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${EDUCATION_PROMPT}${condition}`,
    });

    const content = response.text || "";

    return NextResponse.json({ success: true, data: { content } });
  } catch (error: unknown) {
    console.error("Education content generation error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
