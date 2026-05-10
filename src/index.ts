import { SYSTEM_PROMPT } from "./systemPrompt";
import { searchWeb } from "./lib/search/searchWeb";
import { toEnQuery, buildGlobalQueries } from "./lib/search/queryPlanner";
import { decideSearchAction } from "./lib/chat/shouldSearch";
import { buildWebContext, buildSmartSystemPrompt } from "./lib/chat/buildSmartPrompt";


type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  messages?: ChatMessage[];
  mode?: "fast" | "smart";
};

function getCurrentDate() { 
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body = (await request.json().catch(() => ({}))) as ChatRequestBody;
    const messages = body.messages;

    const mode = body.mode ?? "fast";
    let systemPrompt = SYSTEM_PROMPT;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    if (mode === "smart") {
      const userMessages = [...(messages ?? [])]
        .filter((m) => m.role === "user")
        .map((m) => m.content);

      const lastUserMessage = userMessages[userMessages.length - 1] ?? "";
      const currentDate = getCurrentDate();
      
      try {
        const decision = await decideSearchAction(env, lastUserMessage, currentDate);
        if (decision.needClarification) {
          return Response.json({
            response: decision.clarificationQuestion
          });
        }

        const shouldSearch = decision.shouldSearch;
        const searchQuery = decision.searchQuery || lastUserMessage;

        let results: any[] = [];
        if (shouldSearch) {
          const enQuery = await toEnQuery(env, searchQuery);
          const queries = buildGlobalQueries(enQuery);

          const resultsGroups = shouldSearch
            ? await Promise.all(
              queries.slice(0, 4).map((q) => 
                searchWeb(q, env, {
                  topic: "general",
                  searchDepth: "advanced",
                  maxResults: 8,
                }))
            )
          : [];

          results = resultsGroups.flat();  
        } 
        
        const webContext = buildWebContext(results);

        systemPrompt = buildSmartSystemPrompt(SYSTEM_PROMPT, webContext, currentDate);
      
      } catch (err) {
          console.log("SMART SEARCH ERROR:", err);
          systemPrompt = `
            ${SYSTEM_PROMPT}

            SMART MODE WEB SEARCH FAILED.
            Answer conservatively. Do not invent recent updates.
          `;
      }
    }

    console.log("FINAL SYSTEM PROMPT:", systemPrompt);

    const ai = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        {
          role: "system",
          content: `${systemPrompt}
            CRITICAL:
            - If the user request is ambiguous:
              - First identify possible interpretations
              - If confidence is low, do NOT guess
              - Either ask a clarification question OR state multiple interpretations briefly
            - Ignore previous assistant answers in the chat if they conflict with WEB RESULTS.
            - Do not invent anything not explicitly supported by WEB RESULTS.
            - If the sources do not clearly answer the question, say you could not verify it.`,
        },
        ...messages,
      ],
      temperature: 0,
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

