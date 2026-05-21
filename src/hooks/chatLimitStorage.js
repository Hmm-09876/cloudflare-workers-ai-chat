const LIMIT_KEY = "demo-chat-limit";
const MESSAGES_KEY = "demo-chat-messages";

export const MAX_CHAT = 10;

export function reconcileLimitState(remaining, queue) {
  let r = Math.min(MAX_CHAT, Math.max(0, Number(remaining) || 0));
  let q = (Array.isArray(queue) ? queue : [])
    .map((ts) => Number(ts))
    .filter((ts) => Number.isFinite(ts))
    .sort((a, b) => a - b);

  const now = Date.now();
  while (q.length > 0 && q[0] <= now) {
    r = Math.min(MAX_CHAT, r + 1);
    q.shift();
  }

  if (r >= MAX_CHAT) {
    r = MAX_CHAT;
    q = [];
  }

  return { remaining: r, queue: q };
}

export function loadLimitState() {
  try {
    const raw = localStorage.getItem(LIMIT_KEY);
    if (!raw) return { remaining: MAX_CHAT, queue: [] };
    const data = JSON.parse(raw);
    return reconcileLimitState(data.remaining, data.queue);
  } catch {
    return { remaining: MAX_CHAT, queue: [] };
  }
}

export function saveLimitState(remaining, queue) {
  try {
    localStorage.setItem(
      LIMIT_KEY,
      JSON.stringify({ remaining, queue }),
    );
  } catch {

  }
}

export function loadMessages() {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages) {
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch {

  }
}

export function clearStoredMessages() {
  try {
    localStorage.removeItem(MESSAGES_KEY);
  } catch {

  }
}

export const LIMIT_MSG_TAG = "reached your limit";

export function limitAssistantMessage(cooldownSec) {
  const mm = String(Math.floor(cooldownSec / 60)).padStart(2, "0");
  const ss = String(cooldownSec % 60).padStart(2, "0");
  return `You reached your limit. Try again in ${mm}:${ss}.`;
}
