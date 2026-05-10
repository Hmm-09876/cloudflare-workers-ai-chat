export async function searchWeb(query: string, env: Env, opts: {
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

  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }

  const data: any = await res.json();

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