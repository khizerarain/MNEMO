const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_MODEL = "openai/gpt-4o";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function callLLM(
  messages: ChatMessage[],
  maxTokens: number = 1000,
  responseFormat?: "json_object"
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY environment variable");
  }

  const body: Record<string, unknown> = {
    model: OPENROUTER_MODEL,
    messages,
    max_tokens: maxTokens,
  };

  if (responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.VERCEL_URL || "https://mnemo-brain.vercel.app",
      "X-Title": "MNEMO",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenRouter error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Invalid OpenRouter response: missing message content");
  }

  return content.trim();
}

export function stripMarkdownJson(text: string): string {
  // Remove markdown code blocks if present
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return cleaned;
}
