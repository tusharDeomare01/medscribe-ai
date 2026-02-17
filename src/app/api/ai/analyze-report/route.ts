import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGemini, REPORT_ANALYSIS_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { text, fileBase64, mimeType } = await req.json();

    if (!text && !fileBase64) {
      return NextResponse.json(
        { success: false, error: "Either text or file is required" },
        { status: 400 }
      );
    }

    const ai = getGemini();

    let prompt: string;

    if (fileBase64) {
      // For file uploads, we include the base64 in the prompt context
      prompt = `${REPORT_ANALYSIS_PROMPT}\n\n[File uploaded: ${mimeType || "application/pdf"}. Base64 content attached.]\n\nPlease analyze the following encoded medical report data:\n${fileBase64.substring(0, 5000)}`;
    } else {
      prompt = REPORT_ANALYSIS_PROMPT + text;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let result = {
      labValues: [] as { test: string; value: string; unit: string; referenceRange: string; flag: string }[],
      findings: [] as string[],
      recommendations: [] as string[],
      explanation: "Analysis could not be completed.",
    };

    try {
      const parsed = JSON.parse(response.text || "{}");
      result = { ...result, ...parsed };
    } catch {
      result.explanation = response.text || "Analysis could not be completed.";
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Report analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
