import MessageBubble from "./MessageBubble";
import { styles } from "./styles";
import { useEffect } from "react";

export default function MessageList({ messages, chatBoxRef }) {
  useEffect(() => {
    const el = chatBoxRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, chatBoxRef]);

  return (
    <div ref={chatBoxRef} style={styles.messageScroll}>
      {!messages.length ? (
        <div style={styles.emptyState}>
          <h3 style={styles.emptyTitle}>Start a conversation</h3>
          <p style={styles.emptyText}>Ask something</p>
        </div>
      ) : (
        <div style={styles.messageList}>
          {messages.map((msg, i) => (
            <MessageBubble key={`${msg.role}-${i}`} msg={msg} />
          ))}
        </div>
      )}
    </div>
  );
}
