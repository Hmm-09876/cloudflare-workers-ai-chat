import ReactMarkdown from "react-markdown";
import { styles } from "./styles";

export default function MessageBubble({ msg }) {
    const isUser = msg.role === "user";

    return (
        <div 
            style={{
                ...styles.bubble,
                ...(isUser ? styles.userBubble : styles.assistantBubble),
            }}
        >

            <div style={styles.messageBody}>
                {isUser ? (
                    <div style={styles.plainText}>{msg.content}</div>
                ) : (
                    <ReactMarkdown
                        components={{
                            pre: ({ children }) => (
                                <pre style={styles.codeBlock}>
                                    {children}
                                </pre>
                            ),
                        }}
                    >
                        {msg.content}
                    </ReactMarkdown>
                )}
            </div>
        </div>
    );
}