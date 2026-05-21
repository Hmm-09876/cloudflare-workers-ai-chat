import { readAiText } from "../ai/readAiText";
import { cleanAssistantResponse } from "../security/responseFilter";
import type { ChatMessage } from "./normalizeMessages";

const CHAT_MAX_TOKENS = 300;

const CRITICAL_RULES = `
CRITICAL:
- If the user request is ambiguous, ask a short clarification or list interpretations briefly.
- Ignore previous assistant answers in the chat if they conflict with WEB RESULTS.
- Do not invent anything not explicitly supported by WEB RESULTS.
- If the sources do not clearly answer the question, say you could not verify it.
- Finish the answer; do not stop mid-sentence.`;

export async function runChatAssistant(
  env: Env,
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> {
  const ai = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
    messages: [
      { role: "system", content: `${systemPrompt}${CRITICAL_RULES}` },
      ...messages,
    ],
    temperature: 0,
    max_tokens: CHAT_MAX_TOKENS,
  });

  return cleanAssistantResponse(readAiText(ai));
}
