import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Package } from "lucide-react";
import { Avatar, StatusBadge, Button } from "../../components/ui";
import { MOCK_ORDERS } from "../../data/mockData";

const InquiryDetailPage = ({ selectedInquiry, setSelectedInquiry, inquiries, setInquiries, setPage, selectedStore }) => {
  const [input, setInput] = useState("");
  const chatEnd = useRef(null);
  const inq = selectedInquiry;
  if (!inq) return null;
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [inq?.messages]);

  const sendMsg = () => {
    if (!input.trim()) return;
    const updated = { ...inq, messages: [...inq.messages, { id: inq.messages.length + 1, sender: "customer", content: input, time: new Date().toLocaleString() }], lastMessageAt: new Date().toLocaleString() };
    setSelectedInquiry(updated);
    setInquiries(p => p.map(i => i.id === inq.id ? updated : i));
    setInput("");
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => setPage(selectedStore ? "store" : "main")}><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <h3 className="font-bold text-sm">{inq.title}</h3>
          <p className="text-xs text-gray-500">{inq.storeName}</p>
        </div>
        <StatusBadge status={inq.status} />
      </div>

      {inq.orderId && (
        <div className="bg-gray-50 rounded-lg p-2 mb-3 text-xs text-gray-600 flex items-center gap-2">
          <Package size={14} />
          <span>주문: {MOCK_ORDERS.find(o => o.id === inq.orderId)?.productName || "N/A"}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {inq.messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === "customer" ? "justify-end" : m.sender === "system" ? "justify-center" : "justify-start"}`}>
            {m.sender === "system" ? (
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{m.content}</span>
            ) : (
              <>
                {m.sender === "operator" && <Avatar name="S" bg="bg-orange-100 text-orange-600" />}
                <div className={`max-w-xs mx-2 px-3 py-2 rounded-2xl text-sm ${m.sender === "customer" ? "bg-indigo-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
                  {m.content}
                  {m.time && <p className={`text-xs mt-1 ${m.sender === "customer" ? "text-indigo-200" : "text-gray-400"}`}>{m.time}</p>}
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={chatEnd} />
      </div>

      {inq.status !== "RESOLVED" && inq.status !== "종료" ? (
        <div className="flex gap-2">
          <input className="flex-1 border rounded-xl px-4 py-2 text-sm" placeholder="메시지를 입력하세요..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} />
          <Button onClick={sendMsg} className="rounded-xl"><Send size={16} /></Button>
        </div>
      ) : (
        <div className="text-center text-xs text-gray-400 py-2">상담이 종료되었습니다</div>
      )}
    </div>
  );
};

export default InquiryDetailPage;
