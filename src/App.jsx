import { useChat } from "./hooks/useChat";
import ChatUI from "./components/ChatUI";

export default function App() {
  const chat = useChat();

  return <ChatUI {...chat} />;
}