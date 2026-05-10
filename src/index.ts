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

async function toEnQuery(env: Env, query: string) {
  const res = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
    messages: [
      {
        role: "system",
        content: `
          Convert this query into a GLOBAL English search query.
          
          RULES:
          - Keep meaning unchanged
          - Do NOT localize
          - Prefer international terms
          - Output ONLY the query
        `,
      },
      { role: "user", content: query},
    ],
    temperature: 0,
  });

  return (res as any)?.response ?? query;
}

function buildGlobalQueries(enQuery: string) {
  return [ 
    enQuery,
    `${enQuery} trending`,
    `${enQuery} worldwide`,
  ]
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
      
      const currentDate = new Intl.DateTimeFormat("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());

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
                  "needClarification": boolean,
                  "searchQuery": string,
                  "clarificationQuestion": string,
                  "reason": string
                }

                Current date: ${currentDate}
                Rules:
                - Decide based on the latest user message.
                - If the user asks about current, latest, hot, trending, now, recently, or similar => consider search.
                - If the user asks for "hot/trending/best right now" or any similar and the metric is unclear, say the metric is ambiguous and give the most reasonable interpretation.
                - If "hot" / "best" / "trending" is ambiguous or anything similar and no metric is specified, set needClarification=true.
                - Examples of missing metric:
                  - hot by player count
                  - hot by popularity
                  - hot by search trend
                  - hot by revenue
                - If needClarification=true, output a short clarificationQuestion instead of searchQuery.
                - Output only JSON.
              `,
            },
            { role: "user", content: lastUserMessage },
          ],
          max_tokens: 160,
          temperature: 0,
        }
      );

      const shouldSearchResp = 
        typeof shouldSearchCheck === "string"
        ? shouldSearchCheck
        : String((shouldSearchCheck as any)?.response ?? "");
      
      let decision: { 
        shouldSearch: boolean; 
        needClarification?: boolean;
        searchQuery?: string;
        clarificationQuestion?: string;
        reason?: string;
      };
      try {
        decision = JSON.parse(shouldSearchResp);
      } catch {
        decision = { shouldSearch: true, searchQuery: lastUserMessage };
      }

      const shouldSearch = decision.shouldSearch;
      const searchQuery = decision.searchQuery || lastUserMessage;

      if (decision.needClarification) {
        return Response.json({
          response: decision.clarificationQuestion
        });
      }

      try {
        // const results = shouldSearch 
        //   ? await searchWeb(searchQuery, env, {
        //     topic: "general",
        //     searchDepth: "advanced",
        //     maxResults: 8,
        //   }) : [];

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

        const results = resultsGroups.flat();

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
          - Use WEB RESULTS only if they are relevant.
          - Priority global/english sources.
          - If web results do not clearly support an answer, say you could not verify it.
          - Prefer a short direct answer over a long list.
          - Mention the basis of the answer, for example: search trend, current popularity, or recent mentions.
          - Never combine unrelated sources into one.
              
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
    // const ai = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
    //   messages: [
    //     { role: "system", content: systemPrompt },
    //     ...messages,
    //   ],
    // });

    const lastUserMessage = [...(messages ?? [])]
        .filter((m) => m.role === "user")
        .at(-1)?.content ?? "";
    
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
        // {
        //   role: "user",
        //   content: lastUserMessage,
        // },
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