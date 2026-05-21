import ModeToggle from "./chat/ModeToggle";
import Composer from "./chat/Composer";
import { styles } from "./chat/styles";
import MessageList from "./chat/MessageList";

export default function ChatUI({
  messages,
  input,
  loading,
  canSend,
  chatBoxRef,
  onSend,
  handleInputChange,
  handleKeyDown,
  mode,
  setMode,
  maxInputLength,
  limitText,
  clearHistory,
  hasMessages,
}) {
  return (
    <main style={styles.page}>
      <section style={styles.shell}>
        <div style={styles.topBar}>
          <div>
            <p style={styles.kicker}>Cloudflare Workers AI</p>
            <h1 style={styles.title}>AI Chat Demo</h1>
            <p style={styles.subtitle}>
              Portfolio project showcasing an AI chat app powered by Cloudflare Workers AI.
            </p>
          </div>

          <a
            href="https://github.com/Hmm-09876/cloudflare-workers-ai-chat.git"
            target="_blank"
            rel="noreferrer"
            style={styles.repoLink}
          >
            View repo
          </a>
        </div>

        <div style={styles.chatBox}>
          {hasMessages && (
            <div style={styles.chatToolbar}>
              <button
                type="button"
                onClick={clearHistory}
                disabled={loading}
                style={styles.clearButton}
                title="Clear chat history"
              >
                Clear chat
              </button>
            </div>
          )}
          <MessageList messages={messages} chatBoxRef={chatBoxRef} />
        </div>

        <ModeToggle mode={mode} setMode={setMode} />

        <Composer
          limitText={limitText}
          input={input}
          loading={loading}
          canSend={canSend}
          onSend={onSend}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          maxInputLength={maxInputLength}
        />
      </section>
    </main>
  );
}
