import { SYSTEM_PROMPT } from "../../systemPrompt";
import { searchWeb } from "../search/searchWeb";
import { toEnQuery, buildGlobalQueries } from "../search/queryPlanner";
import { decideSearchAction } from "./shouldSearch";
import { buildWebContext, buildSmartSystemPrompt } from "./buildSmartPrompt";
import type { ChatMessage } from "./normalizeMessages";

function currentDate() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export type SmartResolveResult =
  | { kind: "clarification"; text: string }
  | { kind: "prompt"; prompt: string };

export async function resolveSmartMode(
  env: Env,
  messages: ChatMessage[],
): Promise<SmartResolveResult> {
  const lastUserMessage =
    messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
  const date = currentDate();

  try {
    const decision = await decideSearchAction(env, lastUserMessage, date);

    if (decision.needClarification && decision.clarificationQuestion) {
      return { kind: "clarification", text: decision.clarificationQuestion };
    }

    let results: Array<{
      title: string;
      url: string;
      content: string;
      score: number;
      published_date: string;
    }> = [];

    if (decision.shouldSearch) {
      const query = decision.searchQuery || lastUserMessage;
      const enQuery = await toEnQuery(env, query);
      const queries = buildGlobalQueries(enQuery).slice(0, 4);
      const groups = await Promise.all(
        queries.map((q) =>
          searchWeb(q, env, {
            topic: "general",
            searchDepth: "advanced",
            maxResults: 8,
          }),
        ),
      );
      results = groups.flat();
    }

    return {
      kind: "prompt",
      prompt: buildSmartSystemPrompt(SYSTEM_PROMPT, buildWebContext(results), date),
    };
  } catch {
    return {
      kind: "prompt",
      prompt: `${SYSTEM_PROMPT}\nSMART MODE WEB SEARCH FAILED. Answer conservatively.`,
    };
  }
}
