import MessageBubble from "./MessageBubble";
import { styles } from "./styles";

export default function MessageList({ messages, chatBoxRef }) {
    return (
        <div style={styles.chatBox} ref={chatBoxRef}>
            {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
            ))}
        </div>
    );
}