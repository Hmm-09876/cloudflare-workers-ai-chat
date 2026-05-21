import { SYSTEM_PROMPT } from "./systemPrompt";
import { normalizeMessages } from "./lib/chat/normalizeMessages";
import { resolveSmartMode } from "./lib/chat/smartMode";
import { runChatAssistant } from "./lib/chat/runAssistant";
import { enforceRateLimit } from "./lib/security/rateLimiter";

export { RateLimiter } from "./lib/security/rateLimiter";

type ChatRequestBody = {
  messages?: unknown;
  mode?: "fast" | "smart";
};

function rateLimitResponse(rate: { retryAfter: number }) {
  return new Response(
    JSON.stringify({
      error: "You reached your limit",
      retryAfter: rate.retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(rate.retryAfter),
        "X-RateLimit-Remaining": "0",
      },
    },
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }

      const rate = await enforceRateLimit(env, request, {
        capacity: 10,
        refillPerMinute: 0.25,
      });

      if (!rate.allowed) {
        return rateLimitResponse(rate);
      }

      const body = (await request.json().catch(() => null)) as ChatRequestBody | null;
      const mode = body?.mode ?? "fast";

      if (mode !== "fast" && mode !== "smart") {
        return Response.json({ error: "mode must be fast or smart" }, { status: 400 });
      }

      const messages = normalizeMessages(body?.messages);
      if (!messages) {
        return Response.json(
          {
            error:
              "messages must be a non-empty array of user/assistant messages with valid content",
          },
          { status: 400 },
        );
      }

      let response: string;

      if (mode === "smart") {
        const smart = await resolveSmartMode(env, messages);
        if (smart.kind === "clarification") {
          return Response.json({ response: smart.text });
        }
        response = await runChatAssistant(env, smart.prompt, messages);
      } else {
        response = await runChatAssistant(env, SYSTEM_PROMPT, messages);
      }

      if (!response) {
        return Response.json({ error: "empty AI response" }, { status: 500 });
      }

      return new Response(JSON.stringify({ response }), {
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(rate.remaining),
          "Retry-After": String(rate.retryAfter),
        },
      });
    } catch (err) {
      console.error("UNHANDLED ERROR:", err);
      return Response.json({ error: "internal server error" }, { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
