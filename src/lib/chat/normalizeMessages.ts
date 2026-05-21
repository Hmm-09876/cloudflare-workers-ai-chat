export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const MAX_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 4000;
const MAX_TOTAL_CHARS = 12000;

export function normalizeMessages(messages: unknown): ChatMessage[] | null {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return null;
  }

  const normalized: ChatMessage[] = [];
  let totalChars = 0;

  for (const item of messages) {
    if (!item || typeof item !== "object") return null;

    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;

    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;

    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_MESSAGE_CHARS) return null;

    totalChars += trimmed.length;
    if (totalChars > MAX_TOTAL_CHARS) return null;

    normalized.push({ role, content: trimmed });
  }

  return normalized;
}
