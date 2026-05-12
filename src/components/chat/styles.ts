export const styles = {
  page: {
    minHeight: "100vh",
    padding: "24px",
    background: 
      "radial-gradient(circle at top, rgba(59, 130, 246, 0.18), transparent 35%), #0b1020",
    color: "#e5e7eb",
    display: "flex",
    flexDirection: "column",
  },

  shell: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    maxWidth: "980px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },

///////////////////////////////////////////////////////////////////////////////////////////////////////

  kicker: {
    margin: "0 0 6px",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#93c5fd",
  },

  title: {
    margin: 0,
    fontSize: "clamp(32px, 5vw, 52px)",
    lineHeight: 1.05,
    fontWeight: 800,
    color: "#ffffff",
  },

  subtitle: {
    margin: "10px 0 0",
    maxWidth: "680px",
    fontSize: "15px",
    lineHeight: 1.6,
    color: "#cbd5e1",
  },

  repoLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.06)",
    color: "#ffffff",
    textDecoration: "none",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.18)",
    whiteSpace: "nowrap",
  },

//////////////////////////////////////////////////////////////////////////////////////////////

  modeRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  modeButton: {
    padding: "10px 16px",
    borderRadius: "999px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#e5e7eb",
    cursor: "pointer",
    fontWeight: 600,
  },

  modeButtonActive: {
    background: "#3b82f6",
    borderColor: "#60a5fa",
    color: "#ffffff",
    boxShadow: "0 10px 24px rgba(59, 130, 246, 0.25)",
  },

  chatBox: {
    height: "60vh",
    minHeight: "420px",
    padding: "18px",
    borderRadius: "24px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 16px 50px rgba(0, 0, 0, 0.26)",
  },

  messageList: {
    overflowY: "auto",
    scrollBehavior: "smooth",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingRight: "4px",
    alignItems: "flex-start",
  },

  emptyState: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "24px",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px dashed rgba(255, 255, 255, 0.12)",
  },

  emptyTitle: {
    lineHeight: 1.2,
    margin: "0 0 8px",
    fontSize: "40px",
    fontWeight: 700,
    color: "#ffffff",
  },

  emptyText: {
    margin: 50,
    fontSize: "20px",
    lineHeight: 1.7,
    color: "#cbd5e1",
    maxWidth: "520px",
  },

///////////////////////////////////////////////////////////////////////////////////////////////////

  bubble: {
    padding: "14px 16px",
    borderRadius: "18px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    maxWidth: "70%",
  },

  userBubble: {
    marginLeft: "auto",
    background: "rgba(59, 130, 246, 0.18)",
    borderColor: "rgba(96, 165, 250, 0.25)",
  },

  assistantBubble: {
    background: "rgba(255, 255, 255, 0.05)",
  },

  messageBody: {
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#e5e7eb",
    wordBreak: "break-word",
    textAlign: "left",
  },

  plainText: {
    whiteSpace: "pre-wrap",
  },

  composer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    borderRadius: "20px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 10px 35px rgba(0, 0, 0, 0.2)",
  },

  inputWrapper: {
    position: "relative",
  },

  input: {
    width: "100%",
    resize: "none",
    minHeight: "110px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(255, 255, 255, 0.04)",
    color: "#ffffff",
    outline: "none",
    lineHeight: 1.6,
    paddingBottom: "36px",
  },

  inputCounter: {
    position: "absolute",
    right: "14px",
    bottom: "12px",
    fontSize: "12px",
    color: "#94a3b8",
    pointerEvents: "none",
    background: "rgba(15, 23, 42, 0.9)",
    padding: "2px 6px",
    borderRadius: "999px",
  },

  composerFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  button: {
    padding: "10px 18px",
    borderRadius: "14px",
    border: "none",
    background: "#3b82f6",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 10px 24px rgba(59, 130, 246, 0.25)",
  },

  buttonDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
    boxShadow: "none",
  },
};