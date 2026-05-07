import { SYSTEM_PROMPT } from "./systemPrompt";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  messages?: ChatMessage[];
  mode?: "fast" | "smart";
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body = (await request.json().catch(() => ({}))) as ChatRequestBody;
    const messages = body.messages;
    const mode = body.mode ?? "fast";

    const systemPrompt = 
      mode === "smart"
        ? `${SYSTEM_PROMPT}\n\nAdd "yohoho" in your phrase.`
        : SYSTEM_PROMPT;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    const ai = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    console.log("AI RAW:", ai);

    const response = 
      typeof ai === "string"
      ? ai
      : (ai as any)?.response ?? (ai as any)?.text ?? "";

    if (!response) {
      return Response.json({ error: "emty AI resp", raw: ai }, { status: 500 });
    }

    return Response.json({ response });
  },
} satisfies ExportedHandler<Env>;