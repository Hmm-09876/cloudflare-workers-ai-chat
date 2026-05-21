import { styles } from "./styles"

export default function Composer({
    input,
    handleKeyDown,
    loading,
    canSend,
    onSend,
    maxInputLength,
    limitText,
    handleInputChange,
}) {
    return (
        <div style={styles.composer}>
            <div style={styles.inputWrapper}>
                <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={4}
                    disabled={false}
                    style={styles.input}
                />

                <span style={styles.inputCounter}>
                    {input.length}/{maxInputLength}
                </span>
            </div>

            <div style={styles.composerFooter}>
                <div style={styles.limitText}>
                    {limitText}
                </div>
                
                <button
                    onClick={onSend}
                    disabled={!canSend || !input.trim()}
                    style={{
                        ...styles.button,
                        ...(!canSend || !input.trim() ? styles.buttonDisabled : {}),
                    }}
                >
                    {loading ? "Thinking..." : "Send"}
                </button>
            </div>
        </div>
    );
}