import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGemini, SCHEDULING_BOT_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { message, history } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
    }

    const ai = getGemini();

    const contextMessages = (history || [])
      .slice(-10)
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join("\n");

    const fullPrompt = `${contextMessages}\nuser: ${message}`;

    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: SCHEDULING_BOT_PROMPT,
      },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text || "";
            if (text) {
              const data = `data: ${JSON.stringify({ text, done: false })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: "", done: true })}\n\n`));
          controller.close();
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Stream error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: "", done: true, error: errMsg })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    console.error("Scheduling bot error:", error);
    return new Response(JSON.stringify({ error: "AI processing failed" }), { status: 500 });
  }
}
