import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  try {
    const result = streamText({
      model: openai('gpt-4o'),
      system: 'You are a tactical advisor for a space invaders game. Give short, punchy, tactical advice based on the current game state provided. Be encouraging but serious like a sci-fi commander. Keep it under 2 sentences.',
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    return new Response(JSON.stringify({ error: 'AI Service Unavailable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

