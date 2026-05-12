import { styles } from "./styles"

export default function Composer({
    input,
    handleKeyDown,
    loading,
    onSend,
    maxInputLength,
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
                <button
                    onClick={onSend}
                    disabled={loading || !input.trim()}
                    style={{
                        ...styles.button,
                        ...(loading || !input.trim() ? styles.buttonDisabled : {}),
                    }}
                >
                    {loading ? "Thinking..." : "Send"}
                </button>
            </div>
        </div>
    );
}