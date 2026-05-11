import ReactMarkdown from "react-markdown";
import { styles } from "./styles";

export default function MessageBubble({ msg }) {
    const isUser = msg.role === "user";

    return (
        // <div 
        //     style={{
        //       ...styles.message,
        //       alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
        //       backgroundColor: msg.role === "user" ? "#2563eb" : "#374151",
        //       color: "#fff"
        //       }}>
        
        //     <ReactMarkdown>
        //         {msg.content}
        //     </ReactMarkdown>
        // </div>

        <div 
            style={{
                ...styles.bubble,
                ...(isUser ? styles.userBubble : styles.assistantBubble),
            }}
        >
            {/* <div style={styles.roleLabel}>{isUser ? "You" : "Assistant"}</div> */}

            <div style={styles.messageBody}>
                {isUser ? (
                    <div style={styles.plainText}>{msg.content}</div>
                ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                )}
            </div>
        </div>
    );
}