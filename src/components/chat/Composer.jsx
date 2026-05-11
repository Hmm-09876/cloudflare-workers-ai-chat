import { styles } from "./styles"
import { useRef } from "react";

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
    // const inputRef = useRef(null);
    return (
        // <div style={styles.inputWrapper}>
        //     <textarea
        //         value={input}
        //         onChange={handleInputChange}
        //         onKeyDown={handleKeyDown}
        //         placeholder="Type your message..."
        //         style={styles.input}
        //     />

        //     <div style={styles.counter}>
        //         {input.length}/{maxInputLength}
        //     </div>
        
        //     <button onClick={onSend} disabled={loading} style={styles.button}>
        //         {loading ? "Thinking..." : "Send"}
        //     </button>
        // </div>

        <div style={styles.composer}>
            <div style={styles.inputWrapper}>
                <textarea
                    // ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    // onKeyDown={(e) => {
                    //     handleKeyDown?.(e);

                    //     if (e.key === "Enter" && !e.shiftKey) {
                    //         setTimeout(() => {
                    //             inputRef.current?.focus();
                    //         }, 0);
                    //     }
                    // }}
                    onKeyDown={(handleKeyDown)}
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
                    // type="button"
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