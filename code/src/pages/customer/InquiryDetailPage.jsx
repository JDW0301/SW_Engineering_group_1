import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Package } from "lucide-react";
import { Avatar, StatusBadge, Button, Card } from "../../components/ui";

const InquiryDetailPage = ({ selectedDetail, detailBackPage, supportSessions, setSupportSessions, supportMessagesBySessionId, setSupportMessagesBySessionId, inquiryPosts, inquiryRepliesByPostId, setPage }) => {
  const [input, setInput] = useState("");
  const chatEnd = useRef(null);
  const supportSession = selectedDetail?.kind === "support" ? supportSessions.find(session => session.id === selectedDetail.id) : null;
  const inquiryPost = selectedDetail?.kind === "inquiry" ? inquiryPosts.find(post => post.id === selectedDetail.id) : null;
  const supportMessages = supportSession ? supportMessagesBySessionId[supportSession.id] || [] : [];
  const inquiryReplies = inquiryPost ? inquiryRepliesByPostId[inquiryPost.id] || [] : [];

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [supportMessages]);

  if (!selectedDetail) return null;

  const sendMsg = () => {
    if (!supportSession) return;
    if (!input.trim()) return;
    const now = new Date().toLocaleString();
    const nextMessage = { id: supportMessages.length + 1, supportSessionId: supportSession.id, sender: "customer", content: input, time: now };
    setSupportMessagesBySessionId(prev => ({ ...prev, [supportSession.id]: [...supportMessages, nextMessage] }));
    setSupportSessions(prev => prev.map(session => session.id === supportSession.id ? { ...session, lastMessageAt: now } : session));
    setInput("");
  };

  if (selectedDetail.kind === "inquiry") {
    if (!inquiryPost) return null;
    return (
      <div>
        <button type="button" onClick={() => setPage(detailBackPage || "inquiryList")} className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <ArrowLeft size={16} /> 목록
        </button>
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="font-bold mb-1">{inquiryPost.title}</h3>
              <p className="text-xs text-gray-500">{inquiryPost.createdAt} · {inquiryPost.customerName || "고객"}</p>
            </div>
            <StatusBadge status={inquiryPost.status} />
          </div>
          {inquiryPost.orderId && (
            <div className="flex items-center gap-1.5 mb-2 bg-gray-50 rounded px-2 py-1.5">
              <Package size={13} className="text-gray-400" />
              <span className="text-xs text-gray-600">주문 ID: {inquiryPost.orderId}</span>
            </div>
          )}
          <p className="text-sm text-gray-700 mb-3">{inquiryPost.content}</p>
          {inquiryReplies.length > 0 ? inquiryReplies.map(reply => (
            <div key={reply.id} className="bg-indigo-50 rounded-lg p-3 mb-2">
              <p className="text-xs font-medium text-indigo-700 mb-1">답변 · {reply.createdAt}</p>
              <p className="text-sm text-indigo-800">{reply.content}</p>
            </div>
          )) : (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500">답변 대기 중입니다.</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (!supportSession) return null;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => setPage(detailBackPage || "supportList")}><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <h3 className="font-bold text-sm">{supportSession.title}</h3>
          <p className="text-xs text-gray-500">{supportSession.storeName}</p>
        </div>
        <StatusBadge status={supportSession.status} />
      </div>

      {supportSession.orderId && (
        <div className="bg-gray-50 rounded-lg p-2 mb-3 text-xs text-gray-600 flex items-center gap-2">
          <Package size={14} />
          <span>주문: {supportSession.orderProductName || supportSession.orderInfo || "N/A"}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {supportMessages.map(m => (
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

      {supportSession.status !== "RESOLVED" ? (
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
