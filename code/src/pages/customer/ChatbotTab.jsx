import { useState, useEffect, useRef } from "react";
import { Send, ArrowRight } from "lucide-react";
import { Avatar, Button } from "../../components/ui";
import { MOCK_FAQ } from "../../data/mockData";

const ChatbotTab = ({ store, onHandoff }) => {
  const [messages, setMessages] = useState([{ id: 0, sender: "bot", content: `${store.name}에 오신 것을 환영합니다! 무엇을 도와드릴까요?` }]);
  const [input, setInput] = useState("");
  const [showFaq, setShowFaq] = useState(true);
  const chatEnd = useRef(null);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { id: messages.length, sender: "user", content: input };
    const botReply = { id: messages.length + 1, sender: "bot", content: getBotReply(input) };
    setMessages(p => [...p, userMsg, botReply]);
    setInput("");
    setShowFaq(false);
  };

  const getBotReply = (q) => {
    if (q.includes("배송")) return "주문 확인 후 1~3 영업일 내 발송됩니다. 더 자세한 사항은 상담사에게 연결해드릴까요?";
    if (q.includes("교환") || q.includes("반품")) return "수령 후 7일 이내 교환/반품이 가능합니다. 자세한 안내가 필요하시면 상담사 연결을 눌러주세요.";
    if (q.includes("결제")) return "신용카드, 계좌이체, 간편결제를 지원합니다.";
    return "죄송합니다, 해당 질문에 대한 답변을 찾지 못했습니다. 상담사 연결을 통해 더 정확한 답변을 받으실 수 있습니다.";
  };

  const askFaq = (faq) => {
    setMessages(p => [...p, { id: p.length, sender: "user", content: faq.question }, { id: p.length + 1, sender: "bot", content: faq.answer }]);
    setShowFaq(false);
  };

  return (
    <div className="flex flex-col" style={{ height: "60vh" }}>
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            {m.sender === "bot" && <Avatar name="B" bg="bg-green-100 text-green-600" />}
            <div className={`max-w-xs mx-2 px-3 py-2 rounded-2xl text-sm ${m.sender === "user" ? "bg-indigo-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
              {m.content}
            </div>
          </div>
        ))}
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
        <input className="flex-1 border rounded-xl px-4 py-2 text-sm" placeholder="메시지를 입력하세요..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
        <Button onClick={send} className="rounded-xl"><Send size={16} /></Button>
      </div>
      <button onClick={() => onHandoff(messages)} className="mt-2 text-xs text-indigo-600 hover:underline text-center flex items-center justify-center gap-1">
        <ArrowRight size={14} /> 상담사 연결
      </button>
    </div>
  );
};

export default ChatbotTab;
