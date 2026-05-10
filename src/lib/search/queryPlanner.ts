export async function toEnQuery(env: Env, query: string) {
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

export function buildGlobalQueries(enQuery: string) {
  return [ 
    enQuery,
    `${enQuery} trending`,
    `${enQuery} worldwide`,
  ]
}