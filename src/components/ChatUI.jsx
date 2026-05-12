import ModeToggle from "./chat/ModeToggle";
import Composer from "./chat/Composer";
import { styles } from "./chat/styles"
import MessageList from "./chat/MessageList";

export default function ChatUI({
  messages,
  input,
  loading,
  chatBoxRef,
  onSend,
  handleInputChange,
  handleKeyDown,
  mode,
  setMode,
  maxInputLength,
}) {
  return (
    // <div style={styles.container}>
    //   <h2 style={styles.title}>Demo Chat Bot</h2>

    //   <MessageList messages={props.messages} chatBoxRef={props.chatBoxRef} />

    //   <ModeToggle mode={props.mode} setMode={props.setMode} />

    //   <Composer
    //     input={props.input}
    //     handleInputChange={props.handleInputChange}
    //     handleKeyDown={props.handleKeyDown}
    //     onSend={props.onSend}
    //     loading={props.loading}
    //     maxInputLength={props.maxInputLength}
    //   />
    // </div>

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
            🔗 View repo 
          </a>
        </div>

        <div style={styles.chatBox}>
          <MessageList messages={messages} chatBoxRef={chatBoxRef} />
        </div>

        <ModeToggle mode={mode} setMode={setMode} />

        <Composer
          input={input}
          loading={loading}
          onSend={onSend}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          maxInputLength={maxInputLength}
        />
      </section>
    </main>
  );
}

