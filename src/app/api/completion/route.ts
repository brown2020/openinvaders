import { streamText } from "ai";
import { parseCompletionRequest } from "@/lib/completion/request";

export const maxDuration = 30;

/**
 * Optional AI tactical advisor.
 * - Invalid body → 400
 * - Missing OPENAI_API_KEY → soft 200 text (CI stays quiet; no console 503 spam)
 * - OpenAI client created only inside the handler (deferred init)
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseCompletionRequest(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  // Soft-degrade when secret is unset so CI/local runs stay quiet.
  if (!process.env.OPENAI_API_KEY) {
    return new Response("Advisor offline — trust your reflexes, pilot.", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const { createOpenAI } = await import("@ai-sdk/openai");
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const result = streamText({
      model: openai("gpt-4o"),
      system:
        "You are a tactical advisor for a space invaders game. Give short, punchy, tactical advice based on the current game state provided. Be encouraging but serious like a sci-fi commander. Keep it under 2 sentences.",
      prompt: parsed.data.prompt,
    });

    return result.toTextStreamResponse();
  } catch {
    return Response.json({ error: "AI Service Unavailable" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}
