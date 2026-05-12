import MessageBubble from "./MessageBubble";
import { styles } from "./styles";
import { useEffect } from "react";

export default function MessageList({ messages, chatBoxRef }) {
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTo({
                top: chatBoxRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    if (!messages.length) {
        return (
            <div style={styles.emptyState}>
                <h3 style={styles.emptyTitle}>Start a conversation</h3>
                <p style={styles.emptyText}>
                    Ask something
                </p>
            </div>
        )
    }

    return (
        <div ref={chatBoxRef} style={styles.messageList}>
            {messages.map((msg, i) => (
                <MessageBubble key={`${msg.role}-${i}`} msg={msg} />
            ))}
        </div>
    );
}