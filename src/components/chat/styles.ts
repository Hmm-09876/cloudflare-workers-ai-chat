export const styles = {
  container: {
    width: "80vw",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 12,
    color: "#fff",
    height: "100%",
    boxSizing: "border-box",
  },

  title: {
    textAlign: "center",
    marginBottom: 10,
    marginTop: -10,
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
    lineHeight: 1.4,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },

  inputWrapper: {
    marginTop: 20,
    position: "relative",
  },

  counter: {
    position: "absolute",
    right: 10,
    bottom: 8,
    fontSize: 12,
    opacity: 0.45,
    pointerEvents: "none",
  },

  input: {
    marginTop: 5,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #374151",
    resize: "none",
    minHeight: 50,
    fontSize: 14,
    backgroundColor: "#1f2937",
    color: "#fff",
    textAlign: "left",
    boxSizing: "border-box",
    width: "100%",
    outline: "none",
  },

  button: {
    marginTop: 5,
  },

  modeRow: {
    display: "flex",
    gap: 8,
    marginTop: 10,
  },

  modeButton: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#1f2937",
    color: "#9ca3af",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

  modeButtonActive: {
    background: "#2563eb",
    color: "#fff",
    border: "1px solid #3b82f6",
    transform: "translateY(-1px)",
  },
};