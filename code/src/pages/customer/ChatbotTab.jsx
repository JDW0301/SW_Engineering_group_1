import { useState, useEffect, useRef } from "react";
import { Send, ArrowRight } from "lucide-react";
import { Avatar, Button } from "../../components/ui";
import { streamChatbotReply } from "../../api/ai";
import { MOCK_FAQ } from "../../data/mockData";

const buildStoreContext = (store) => [
  `스토어명: ${store.name}`,
  `카테고리: ${store.category ?? "미정"}`,
  `소개: ${store.desc ?? store.description ?? "정보 없음"}`,
  `전화번호: ${store.phone ?? "정보 없음"}`,
  `주소: ${store.address ?? "정보 없음"}`,
  `영업시간: ${store.operatingHours ?? store.businessHours ?? "정보 없음"}`,
].join("\n");

const toAiHistory = (messages) => messages
  .filter(message => message.sender === "user" || message.sender === "bot")
  .slice(-20)
  .map(message => ({
    role: message.sender === "user" ? "customer" : "bot",
    content: message.content,
  }));

const ChatbotTab = ({ store, onCreateSupportFromChatbot }) => {
  const [messages, setMessages] = useState([{ id: 0, sender: "bot", content: `${store.name}에 오신 것을 환영합니다! 무엇을 도와드릴까요?` }]);
  const [input, setInput] = useState("");
  const [showFaq, setShowFaq] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [needsHandoff, setNeedsHandoff] = useState(false);
  const chatEnd = useRef(null);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed || isSending) return;

    const userMsg = { id: Date.now(), sender: "user", content: trimmed };
    const botMsg = { id: Date.now() + 1, sender: "bot", content: "" };
    const nextMessages = [...messages, userMsg];

    setMessages([...nextMessages, botMsg]);
    setInput("");
    setShowFaq(false);
    setError("");
    setStatus("AI가 답변을 준비하고 있습니다...");
    setIsSending(true);
    setNeedsHandoff(false);

    let botReply = "";

    try {
      await streamChatbotReply(
        {
          message: trimmed,
          history: toAiHistory(nextMessages),
          store_context: buildStoreContext(store),
        },
        (data) => {
          if (data.thinking) {
            setStatus("AI가 답변을 준비하고 있습니다...");
          }
          if (data.thinking_end) {
            setStatus("");
          }
          if (data.token) {
            botReply += data.token;
            setMessages(prev => prev.map(message => (
              message.id === botMsg.id ? { ...message, content: botReply } : message
            )));
          }
          if (data.final) {
            botReply = data.final;
            setMessages(prev => prev.map(message => (
              message.id === botMsg.id ? { ...message, content: data.final } : message
            )));
          }
          if (data.can_answer === false) {
            setNeedsHandoff(true);
          }
          if (data.error) {
            throw new Error(data.detail || data.error);
          }
          if (data.done) {
            setStatus("");
          }
        }
      );

      if (!botReply) {
        setMessages(prev => prev.map(message => (
          message.id === botMsg.id ? { ...message, content: "답변을 생성하지 못했습니다. 상담사 연결을 이용해 주세요." } : message
        )));
        setNeedsHandoff(true);
      }
    } catch (sendError) {
      const message = sendError.message || "챗봇 서버와 연결하지 못했습니다.";
      setError(message);
      setNeedsHandoff(true);
      setMessages(prev => prev.map(item => (
        item.id === botMsg.id ? { ...item, content: `죄송합니다. ${message} 상담사 연결을 이용해 주세요.` } : item
      )));
    } finally {
      setStatus("");
      setIsSending(false);
    }
  };

  const send = () => {
    sendMessage(input);
  };

  const askFaq = (faq) => {
    sendMessage(faq.question);
  };

  const requestHandoff = () => {
    const title = window.prompt("문의명 입력");
    if (!title || !title.trim()) return;
    onCreateSupportFromChatbot({ title: title.trim(), store, messages });
  };

  return (
    <div className="flex flex-col" style={{ height: "60vh" }}>
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            {m.sender === "bot" && <Avatar name="B" bg="bg-green-100 text-green-600" />}
            <div className={`max-w-xs mx-2 px-3 py-2 rounded-2xl text-sm ${m.sender === "user" ? "bg-indigo-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
              {m.content || "..."}
            </div>
          </div>
        ))}
        {status && <p className="text-xs text-gray-400 px-2">{status}</p>}
        {error && <p className="text-xs text-red-500 px-2">{error}</p>}
        <div ref={chatEnd} />
      </div>
      {showFaq && (
        <div className="mb-3 space-y-1">
          <p className="text-xs text-gray-400 mb-1">자주 묻는 질문</p>
          {MOCK_FAQ.map(f => (
            <button key={f.id} onClick={() => askFaq(f)} className="block w-full text-left px-3 py-2 bg-indigo-50 rounded-lg text-sm text-indigo-700 hover:bg-indigo-100 transition">{f.question}</button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input className="flex-1 border rounded-xl px-4 py-2 text-sm" placeholder="메시지를 입력하세요..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} disabled={isSending} />
        <Button onClick={send} className="rounded-xl" disabled={isSending}><Send size={16} /></Button>
      </div>
      <button onClick={requestHandoff} className={`mt-2 text-xs ${needsHandoff ? "text-red-600" : "text-indigo-600"} hover:underline text-center flex items-center justify-center gap-1`}>
        <ArrowRight size={14} /> {needsHandoff ? "상담사 연결이 필요합니다" : "상담사 연결"}
      </button>
    </div>
  );
};

export default ChatbotTab;
