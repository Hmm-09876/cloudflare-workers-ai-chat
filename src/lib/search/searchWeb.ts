export async function searchWeb(
  query: string,
  env: Env,
  opts: {
    topic?: "general" | "news" | "finance";
    timeRange?: "day" | "week" | "month" | "year";
    searchDepth?: "basic" | "advanced";
    maxResults?: number;
  } = {},
) {
  const tavilyApiKey = env.TAVILY_API_KEY;
  if (!tavilyApiKey) {
    throw new Error("Missing secret: TAVILY_API_KEY");
  }

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tavilyApiKey}`,
    },
    body: JSON.stringify({
      query,
      topic: opts.topic ?? "general",
      time_range: opts.timeRange,
      search_depth: opts.searchDepth ?? "advanced",
      max_results: opts.maxResults ?? 8,
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new Error(
      `Tavily search failed: ${res.status}${bodyText ? ` - ${bodyText.slice(0, 300)}` : ""}`,
    );
  }

  const data = (await res.json()) as { results?: unknown[] };
  const results = data.results ?? [];

  return results.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      title: String(row.title ?? ""),
      url: String(row.url ?? ""),
      content: String(row.content ?? "")
        .replace(/\s+/g, " ")
        .replace(/Skip Navigation/gi, "")
        .replace(/Advertisement/gi, "")
        .slice(0, 300),
      score: Number(row.score ?? 0),
      published_date: String(row.published_date ?? ""),
    };
  });
}
