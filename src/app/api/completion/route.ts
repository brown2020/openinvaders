import { streamText } from "ai";
import {
  ADVISOR_MAX_OUTPUT_TOKENS,
  buildAdvisorPrompt,
  parseCompletionRequest,
} from "@/lib/completion/request";
import {
  allowAdvisorRequest,
  clientAddress,
} from "@/lib/completion/rate-limit";
import { isSameOrigin } from "@/lib/completion/origin";

export const maxDuration = 30;

/**
 * Optional AI tactical advisor.
 * - Cross-origin → 403
 * - Invalid body → 400
 * - Over rate limit → 429
 * - Missing OPENAI_API_KEY → soft 200 text (CI stays quiet)
 * - Provider failure → 500 (the call is awaited before headers are sent)
 * - OpenAI client created only inside the handler (deferred init)
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

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

  const limit = allowAdvisorRequest(clientAddress(req));
  if (!limit.ok) {
    return Response.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
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
      maxOutputTokens: ADVISOR_MAX_OUTPUT_TOKENS,
      system:
        "You are a tactical advisor for a space invaders game. Give short, punchy, tactical advice based on the current game state provided. Be encouraging but serious like a sci-fi commander. Keep it under 2 sentences.",
      prompt: buildAdvisorPrompt(parsed.data),
    });

    // streamText returns before the provider responds. Await the text so an
    // invalid key or upstream error becomes a 500 instead of a broken 200.
    const text = await result.text;
    if (!text.trim()) {
      return Response.json({ error: "AI Service Unavailable" }, { status: 500 });
    }

    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return Response.json({ error: "AI Service Unavailable" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}
