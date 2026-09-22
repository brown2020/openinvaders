import { z } from "zod";

export const completionRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
});

export type CompletionRequest = z.infer<typeof completionRequestSchema>;

export function parseCompletionRequest(input: unknown):
  | { ok: true; data: CompletionRequest }
  | { ok: false; error: string } {
  const parsed = completionRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid completion request" };
  }
  return { ok: true, data: parsed.data };
}
