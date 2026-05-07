// import { useState, useRef, useEffect } from "react";

// export default function App() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // const buildPayloadMessages = (currentMessages, userText) => {
//   //   // const recentMessages = currentMessages.slice(-20).map((m) => ({
//   //   //   role: m.role === "assistant" ? "assistant" : "user",
//   //   //   content: m.content,
//   //   // }));

//   //   const recentMessages = currentMessages.slice(-20);

//   //   return [
//   //     ...recentMessages,
//   //     { role: "user", content: userText },
//   //   ];
//   // };

//   const sendMessage = async () => {
//     if (!input.trim() || loading) return;

//     const userText = input.trim();

//     setMessages((prev) => [...prev, { role: "user", content: userText }]);
//     setInput("");
//     setLoading(true);

//     try {
//       // const payloadMessages = buildPayloadMessages(messages, userText);

//       const payloadMessages = [...messages.slice(-20), { role: "user", content: userText }];

//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ messages: payloadMessages }),
//       });

//       if (!res.ok) {
//         throw new Error(`HTTP ${res.status}`);
//       }

//       const data = await res.json();
//       console.log("API DATA: ", data);

//       const reply = data.response;

//       if (typeof reply !== "string" || !reply.trim()) {
//         throw new Error("Invalid AI resp");
//       }

//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", content: reply },
//       ]);
//     } catch (err) {
//       const errMess = err instanceof Error ? err.message : "unknown err";
//       setMessages((prev) => [
//         ...prev,
//         { 
//           role: "assistant", 
//           content: `API err: ${errMess}`,
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   }; 

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div style={styles.container}>
//       <h2 style={styles.title}>Demo Chat Bot</h2>

//       <div style={styles.chatBox}>
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             style={{
//               ...styles.message,
//               alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
//               backgroundColor: msg.role === "user" ? "#2563eb" : "#374151",
//               color: "#fff"
//             }}
//           >
//             {msg.content}
//           </div>
//         ))}

//         <div ref={chatEndRef} />
//       </div>

//       <textarea
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         onKeyDown={handleKeyDown}
//         placeholder="Type your message..."
//         style={styles.input}
//       />
//     </div>
//   );
// }

// const styles = {
//   container: {
//     maxWidth: "100%",
//     maxWidth: 1400,
//     fontFamily: "Arial, sans-serif",
//     display: "flex",
//     flexDirection: "column",
//     backgroundColor: "#111827",
//     padding: 20,
//     borderRadius: 12,
//     color: "#fff",
//     minHeight: "90vh"
//   },
//   title: {
//     textAlign: "center",
//     marginBottom: 10
//   },
//   chatBox: {
//     border: "1px solid #374151",
//     borderRadius: 10,
//     padding: 10,
//     height: 700,
//     overflowY: "auto",
//     display: "flex",
//     flexDirection: "column",
//     gap: 8,
//     backgroundColor: "#1f2937"
//   },
//   message: {
//     padding: "10px 14px",
//     borderRadius: 16,
//     maxWidth: "70%",
//     wordBreak: "break-word",

//     display: "block",
//     textAlign: "left",
//     lineHeight: 1.4
//   },
//   input: {
//     marginTop: 50,
//     padding: 10,
//     borderRadius: 8,
//     border: "1px solid #374151",
//     resize: "none",
//     minHeight: 50,
//     fontSize: 14,
//     backgroundColor: "#1f2937",
//     color: "#fff",
//     textAlign: "left"
//   }
// };




import { useChat } from "./hooks/useChat";
import ChatUI from "./components/ChatUI";

export default function App() {
  const chat = useChat();

  return <ChatUI {...chat} onSend={chat.sendMessage} />;
}