// import MessageBubble from "./chat/MessageBubble";
import ModeToggle from "./chat/ModeToggle";
import Composer from "./chat/Composer";
import { styles } from "./chat/styles"
import MessageList from "./chat/MessageList";

export default function ChatUI(props) {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Demo Chat Bot</h2>

      <MessageList messages={props.messages} chatBoxRef={props.chatBoxRef} />

      <ModeToggle mode={props.mode} setMode={props.setMode} />

      <Composer
        input={props.input}
        handleInputChange={props.handleInputChange}
        handleKeyDown={props.handleKeyDown}
        onSend={props.onSend}
        loading={props.loading}
        maxInputLength={props.maxInputLength}
      />
    </div>
  );
}

