export default function ChatUI({
    messages,
    input,
    setInput,
    handleKeyDown,
    chatEndRef,
    loading,
    onSend,
}) {
    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Demo Chat Bot</h2>

            <div style={styles.chatBox}>
                {messages.map((msg, i) => (
                <div
                    key={i}
                    style={{
                    ...styles.message,
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    backgroundColor: msg.role === "user" ? "#2563eb" : "#374151",
                    color: "#fff"
                    }}
                >
                    {msg.content}
                </div>
                ))}

                <div ref={chatEndRef} />
            </div>

            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                style={styles.input}
            />

            <button onClick={onSend} disabled={loading} style={styles.button}>
                {loading ? "Sending..." : "Send"}
            </button>
            </div>
    );
}

const styles = {
  container: {
    maxWidth: "100%",
    maxWidth: 1400,
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 12,
    color: "#fff",
    minHeight: "90vh"
  },
  title: {
    textAlign: "center",
    marginBottom: 10
  },
  chatBox: {
    border: "1px solid #374151",
    borderRadius: 10,
    padding: 10,
    height: 700,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    backgroundColor: "#1f2937"
  },
  message: {
    padding: "10px 14px",
    borderRadius: 16,
    maxWidth: "70%",
    wordBreak: "break-word",

    display: "block",
    textAlign: "left",
    lineHeight: 1.4
  },
  input: {
    marginTop: 50,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #374151",
    resize: "none",
    minHeight: 50,
    fontSize: 14,
    backgroundColor: "#1f2937",
    color: "#fff",
    textAlign: "left"
  },
};