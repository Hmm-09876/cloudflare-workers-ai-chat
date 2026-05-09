import { SYSTEM_PROMPT } from "./systemPrompt";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  messages?: ChatMessage[];
  mode?: "fast" | "smart";
};

async function searchWeb(query: string, env: Env) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      search_depth: "advanced",
      max_results: 10,
      topic: "general",
    }),
  });

  console.log("TAVILY STATUS:", res.status);
  console.log("HAS KEY:", !!env.TAVILY_API_KEY);
  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }


  const rawText = await res.text();
  console.log("TAVILY RAW:", rawText);
  const data: any = JSON.parse(rawText);
  // const data: any = await res.json();
  console.log("TAVILY RAW:", JSON.stringify(data, null, 2));
  return (data.results ?? []).map((r: any) => ({
    title: r.title ?? "",
    url: r.url ?? "",
    content: (r.content ?? "").slice(0, 300),
  }));
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

    if (mode === "smart") {
      // const lastUserMessage = 
      //   [...(messages ?? [])].reverse().find((m) => m.role === "user")?.content ?? "";

      const userMessages = [...(messages ?? [])]
        .filter((m) => m.role === "user")
        .map((m) => m.content);

      const lastUserMessage = userMessages[userMessages.length - 1] ?? "";
      const previousUserMessage = userMessages[userMessages.length -2] ?? "";

      const shouldSearchCheck = await env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct",
        {
          messages: [
            {
              role: "system",
              content: `
                You decide whether a web search is needed.

                Reply ONLY with:
                YES
                or
                NO

                Search is needed for:
                - recent news
                - current events
                - live data
                - latest updates
                - time-sensitive info

                Search is not needed for:
                - coding
                - explanations
                - general knowledge
                - casual chat
                - math
                - grammar
              `,
            },
            {
              role: "user",
              content: lastUserMessage,
            },
          ],
          max_tokens: 5,
        }
      );

      const shoudSearchResp = 
        typeof shouldSearchCheck === "string"
        ? shouldSearchCheck
        : String((shouldSearchCheck as any)?.response ?? "");
      
      const shoudSearch = shoudSearchResp.includes("YES");

      const searchQuery = 
        lastUserMessage.length < 35 ? `
          Previous user context:
          ${previousUserMessage} 
          Current question:
          ${lastUserMessage}
        `.trim() : 
          lastUserMessage;

      try {
        const results = shoudSearch ? await searchWeb(searchQuery, env) : [];

        const webContext = 
          results.length > 0
            ? results
              .map(
                (r: any, i: number) => 
                  `${i + 1}. ${r.title}\n${r.url}\n${r.content}`
              )
              .join("\n\n")
            : "No recent web results found";

        systemPrompt = `
          ${SYSTEM_PROMPT}
                    
          STRICT RULES FOR SMART MODE:
          - Keep answers under 150 token.
          - The answer focus on the question.
          - Do NOT make the answers cut off and break the formatting.
          - If the output might get cut off, try to keep the response shorter, else, do detail.
          - Use plain text bullets like:
          "• item 1

          • item 2

          • item 3

          "
          - Do NOT rely on prior knowledge for recent news.
          - If the web results do not contain the answer, say you could not verify it from recent sources.
          - Mention dates when available.
          - Do not mention irrelevant old events unless the web results include them.
              
          WEB RESULTS:
          ${webContext}
        `;
      } catch (err) {
        console.log("SMART SEARCH ERROR:", err);
        systemPrompt = `
          ${SYSTEM_PROMPT}

          SMART MODE WEB SEARCH FAILED.
          Answer conservatively. Do not invent recent updates.
        `;
      }
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    console.log("FINAL SYSTEM PROMPT:", systemPrompt);
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