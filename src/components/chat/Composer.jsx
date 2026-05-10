import { styles } from "./styles"

export default function Composer({
    // messages,
    input,
    // setInput,
    handleKeyDown,
    // chatBoxRef,
    loading,
    onSend,
    // mode, 
    // setMode,
    maxInputLength,
    handleInputChange,
}) {
    return (
        <div style={styles.inputWrapper}>
            <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                style={styles.input}
            />

            <div style={styles.counter}>
                {input.length}/{maxInputLength}
            </div>
        
            <button onClick={onSend} disabled={loading} style={styles.button}>
                {loading ? "Thinking..." : "Send"}
            </button>
        </div>
    );
}