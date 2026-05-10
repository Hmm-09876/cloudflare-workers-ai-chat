import ReactMarkdown from "react-markdown";
import { styles } from "./styles";

export default function MessageBubble({ msg }) {
    return (
        <div 
            style={{
              ...styles.message,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.role === "user" ? "#2563eb" : "#374151",
              color: "#fff"
              }}>
        
            <ReactMarkdown>
                {msg.content}
            </ReactMarkdown>
        </div>
    );
}