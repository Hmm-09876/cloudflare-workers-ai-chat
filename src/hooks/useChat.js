import { useState, useRef, useEffect } from "react";


export function useChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);


  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();

    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    setLoading(true);

    try {
      const payloadMessages = [...messages.slice(-20), { role: "user", content: userText }];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log("API DATA: ", data);

      const reply = data.response;

      if (typeof reply !== "string" || !reply.trim()) {
        throw new Error("Invalid AI resp");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (err) {
      const errMess = err instanceof Error ? err.message : "unknown err";
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: `API err: ${errMess}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }; 

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return {
    messages,
    input,
    setInput,
    loading,
    chatEndRef,
    sendMessage,
    handleKeyDown,
  };
}