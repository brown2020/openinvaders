import { z } from "zod";
import { EXTRA_LIFE } from "@/lib/constants/game";

/** Hard cap so a billed call cannot run away past a two-sentence tip. */
export const ADVISOR_MAX_OUTPUT_TOKENS = 80;

export const advisorEventSchema = z.enum([
  "game_start",
  "wave_start",
  "life_lost",
]);

export const completionRequestSchema = z.object({
  event: advisorEventSchema,
  wave: z.number().int().min(1).max(999),
  lives: z.number().int().min(0).max(EXTRA_LIFE.MAX_LIVES),
  score: z.number().int().min(0).max(1_000_000),
});

export type AdvisorEvent = z.infer<typeof advisorEventSchema>;
export type CompletionRequest = z.infer<typeof completionRequestSchema>;

/**
 * Accept only the canned advisor events. Any free-form `prompt` is ignored
 * so callers cannot turn this route into an open model proxy.
 */
export function parseCompletionRequest(input: unknown):
  | { ok: true; data: CompletionRequest }
  | { ok: false; error: string } {
  const parsed = completionRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid completion request" };
  }
  return { ok: true, data: parsed.data };
}

/** Server-owned prompt text. Numbers come from the validated request. */
export function buildAdvisorPrompt(input: CompletionRequest): string {
  switch (input.event) {
    case "game_start":
      return "Game started. Give a brief, encouraging tactical tip.";
    case "wave_start":
      return `Wave ${input.wave} started. Score: ${input.score}. Give a quick tip for this wave.`;
    case "life_lost":
      return `Player lost a life. ${input.lives} lives remaining. Score: ${input.score}. Give brief encouragement.`;
  }
}
