import { useState, useRef, useEffect } from "react";
import {
  MAX_CHAT,
  loadLimitState,
  saveLimitState,
  loadMessages,
  saveMessages,
  clearStoredMessages,
  LIMIT_MSG_TAG,
  limitAssistantMessage,
} from "./chatLimitStorage";

const MAX_INPUT_LENGTH = 150;
const COOLDOWN_PER_MSG = 45;

function formatMMSS(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function hasLimitMessage(messages) {
  return messages.some(
    (m) =>
      m.role === "assistant" &&
      typeof m.content === "string" &&
      m.content.includes(LIMIT_MSG_TAG),
  );
}

export function useChat() {
  const initialLimit = loadLimitState();
  const [messages, setMessages] = useState(() => loadMessages());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("fast");
  const [chatRemaining, setChatRemaining] = useState(initialLimit.remaining);
  const [refillQueue, setRefillQueue] = useState(initialLimit.queue);
  const [now, setNow] = useState(Date.now());
  const chatBoxRef = useRef(null);
  const atMax = chatRemaining >= MAX_CHAT;

  const enqueueRefill = (seconds = COOLDOWN_PER_MSG) => {
    const ms = seconds * 1000;
    setRefillQueue((prev) => {
      const base = prev.length > 0 ? prev[prev.length - 1] : Date.now();
      return [...prev, base + ms];
    });
  };

  useEffect(() => {
    saveLimitState(chatRemaining, refillQueue);
  }, [chatRemaining, refillQueue]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (atMax && refillQueue.length > 0) {
      setRefillQueue([]);
    }
  }, [atMax, refillQueue.length]);

  useEffect(() => {
    if (refillQueue.length === 0 || atMax) return;

    const tick = setInterval(() => {
      const t = Date.now();
      setNow(t);
      setRefillQueue((prev) => {
        if (prev.length === 0 || t < prev[0]) return prev;
        setChatRemaining((r) => Math.min(MAX_CHAT, r + 1));
        return prev.slice(1);
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [refillQueue.length, atMax]);

  const cooldown =
    !atMax && refillQueue.length > 0
      ? Math.max(0, Math.ceil((refillQueue[0] - now) / 1000))
      : 0;

  const appendLimitMessage = (waitSec) => {
    setMessages((prev) => {
      if (hasLimitMessage(prev)) return prev;
      return [
        ...prev,
        { role: "assistant", content: limitAssistantMessage(waitSec) },
      ];
    });
  };

  useEffect(() => {
    if (initialLimit.remaining > 0) return;
    const wait =
      initialLimit.queue.length > 0
        ? Math.max(
            0,
            Math.ceil((initialLimit.queue[0] - Date.now()) / 1000),
          )
        : COOLDOWN_PER_MSG;
    appendLimitMessage(wait);

  }, []);

  const handleInputChange = (e) => {
    const nextValue = e.target.value;
    if (nextValue.length <= MAX_INPUT_LENGTH) {
      setInput(nextValue);
    } else {
      setInput(nextValue.slice(0, MAX_INPUT_LENGTH));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || chatRemaining <= 0) return;

    const userText = input.trim();
    const nextMessages = [...messages.slice(-9), { role: "user", content: userText }];

    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, mode }),
      });

      const text = await res.text();

      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(text.slice(0, 200) || `HTTP ${res.status}`);
      }

      if (res.status === 429) {
        const wait = Number(data?.retryAfter) || COOLDOWN_PER_MSG;
        setChatRemaining(0);
        setRefillQueue([Date.now() + wait * 1000]);
        appendLimitMessage(wait);
        return;
      }

      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const reply = data.response;
      if (typeof reply !== "string" || !reply.trim()) {
        throw new Error("Invalid AI resp");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);

      const nextRemaining = Math.max(0, chatRemaining - 1);
      setChatRemaining(nextRemaining);
      enqueueRefill();
      if (nextRemaining <= 0) {
        appendLimitMessage(COOLDOWN_PER_MSG);
      }
    } catch (err) {
      const errMess = err instanceof Error ? err.message : "unknown err";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `API error: ${errMess}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (chatRemaining > 0) sendMessage();
    }
  };

  const limitText =
    chatRemaining <= 0
      ? `You reached your limit (${formatMMSS(cooldown)})`
      : cooldown > 0
        ? `Can chat ${chatRemaining} times (${formatMMSS(cooldown)})`
        : `Can chat ${chatRemaining} times`;

  const canSend = chatRemaining > 0 && !loading;

  const clearHistory = () => {
    if (loading) return;
    setMessages([]);
    clearStoredMessages();
  };

  return {
    messages,
    input,
    loading,
    canSend,
    chatBoxRef,
    onSend: sendMessage,
    handleKeyDown,
    handleInputChange,
    mode,
    setMode,
    maxInputLength: MAX_INPUT_LENGTH,
    limitText,
    clearHistory,
    hasMessages: messages.length > 0,
  };
}
