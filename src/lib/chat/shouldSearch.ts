import { readAiText } from "../ai/readAiText";

export type SearchDecision = { 
    shouldSearch: boolean; 
    needClarification?: boolean;
    searchQuery?: string;
    clarificationQuestion?: string;
    reason?: string;
};

export async function decideSearchAction(
    env: Env,
    lastUserMessage: string,
    currentDate: string
): Promise<SearchDecision> {
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
                - Only use the web results provided.
                - Automatically infer the topic and prioritize the most recent relevant web results when freshness matters.                
                - Output only JSON.
              `,
            },
            { role: "user", content: lastUserMessage },
          ],
          max_tokens: 180,
          temperature: 0,
        }
    );

    const raw = readAiText(shouldSearchCheck);

    try {
        return JSON.parse(raw) as SearchDecision;
      } catch {
        return { shouldSearch: true, searchQuery: lastUserMessage };
      }
}