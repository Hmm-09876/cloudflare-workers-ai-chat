import { SYSTEM_PROMPT } from "./systemPrompt";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  messages?: ChatMessage[];
  mode?: "fast" | "smart";
};

async function searchWeb(query: string, env: Env, opts: {
  topic?: "general" | "news" | "finance";
  timeRange?: "day" | "week" | "month" | "year";
  searchDepth?: "basic" | "advanced";
  maxResults?: number;
} = {}) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      topic: opts.topic ?? "general",
      time_range: opts.timeRange,
      search_depth: opts.searchDepth ?? "advanced",
      max_results: opts.maxResults ?? 8,
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
  console.log("TAVILY RAW:", JSON.stringify(data, null, 2));

  return (data.results ?? []).map((r: any) => ({
    title: r.title ?? "",
    url: r.url ?? "",
    content: (r.content ?? "")
      .replace(/\s+/g, " ")
      .replace(/Skip Navigation/gi, "")
      .replace(/Advertisement/gi, "")  
      .slice(0, 300),
    score: r.score ?? 0,
    published_date: r.published_date ?? "",
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

      const userMessages = [...(messages ?? [])]
        .filter((m) => m.role === "user")
        .map((m) => m.content);

      const lastUserMessage = userMessages[userMessages.length - 1] ?? "";

      const shouldSearchCheck = await env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct",
        {
          messages: [
            {
              role: "system",
              content: `
                Return ONLY valid JSON:
                {
                  "shouldSearch": boolean,
                  "searchQuery": string,
                }

                Rules:
                - Use ONLY the user's latest message as the main intent.
                - Do not broaden the query beyond what the user asked.
                - searchQuery should be specific enough to retrieve relevant web results.
                - If no search is needed, searchQuery = "".
              `,
            },
            {
              role: "user",
              content: lastUserMessage,
            },
          ],
          max_tokens: 120,
        }
      );

      const shouldSearchResp = 
        typeof shouldSearchCheck === "string"
        ? shouldSearchCheck
        : String((shouldSearchCheck as any)?.response ?? "");
      
      let decision: { shouldSearch: boolean; searchQuery: string };
      try {
        decision = JSON.parse(shouldSearchResp);
      } catch {
        decision = { shouldSearch: false, searchQuery: "" };
      }

      const shouldSearch = decision.shouldSearch;
      const searchQuery = decision.searchQuery || lastUserMessage;

      try {
        const results = shouldSearch 
          ? await searchWeb(searchQuery, env, {
            topic: "general",
            searchDepth: "advanced",
            maxResults: 8,
          }) : [];

        const filteredResults = results.slice(0,5);

        const webContext = 
          filteredResults.length > 0
            ? filteredResults
              .map(
                (r: any, i: number) => 
                  `${i + 1}. ${r.title}\n${r.url}\n${r.content}\nDate: ${r.published_date}\nScore: ${r.score}`
              )
              .join("\n\n")
            : "No recent web results found";

        systemPrompt = `
          ${SYSTEM_PROMPT}
                    
          STRICT RULES FOR SMART MODE:
          - Use web results when they are provided.
          - If the question is time-sensitive, rely on recent sources.
          - If the question is evergreen or historical, answer normally and do not force news.
          - If web results do not contain the answer, say you could not verify it from the sources.
          - Mention dates when available.
          - Only use claims that are explicitly supported by the web results.
          - Do not infer or combine unrelated articles into new conclusions.
          - If sources are unclear or conflicting, say the situation is unclear.
          - Never invent agreements, outcomes, or confirmed events unless directly stated in the sources.
              
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