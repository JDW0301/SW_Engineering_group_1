import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Package } from "lucide-react";
import { Avatar, StatusBadge, Button, Card } from "../../components/ui";
import { createSupportMessage, listSupportMessages } from "../../api/support";
import { detectProfanity } from "../../api/ai";

const InquiryDetailPage = ({ selectedDetail, detailBackPage, supportSessions, setSupportSessions, supportMessagesBySessionId, setSupportMessagesBySessionId, inquiryPosts, inquiryRepliesByPostId, setPage }) => {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatEnd = useRef(null);
  const supportSession = selectedDetail?.kind === "support" ? supportSessions.find(session => session.id === selectedDetail.id) : null;
  const inquiryPost = selectedDetail?.kind === "inquiry" ? inquiryPosts.find(post => post.id === selectedDetail.id) : null;
  const supportMessages = supportSession ? supportMessagesBySessionId[supportSession.id] || [] : [];
  const inquiryReplies = inquiryPost ? inquiryRepliesByPostId[inquiryPost.id] || [] : [];

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [supportMessages]);

  useEffect(() => {
    if (!supportSession) return undefined;
    let ignore = false;

    const refreshMessages = async () => {
      try {
        const messages = await listSupportMessages(supportSession.id);
        if (!ignore) {
          setSupportMessagesBySessionId(prev => ({ ...prev, [supportSession.id]: messages }));
        }
      } catch (error) {
        if (!ignore) setChatError(error.message || "상담 메시지를 불러오지 못했습니다.");
      }
    };

    refreshMessages();
    const intervalId = supportSession.status !== "RESOLVED" ? window.setInterval(refreshMessages, 3000) : null;
    return () => {
      ignore = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [supportSession?.id, supportSession?.status, setSupportMessagesBySessionId]);

  if (!selectedDetail) return null;

  const sendMsg = async () => {
    if (!supportSession) return;
    if (!input.trim()) return;
    const content = input.trim();
    setIsSending(true);
    setChatError("");
    try {
      const detect = await detectProfanity(content);
      if (detect.is_profanity) {
        setChatError("부적절한 표현이 포함되어 있어 전송할 수 없습니다.");
        setIsSending(false);
        return;
      }
    } catch {
      // 감지 실패 시 전송 허용
    }
    setInput("");
    try {
      const nextMessage = await createSupportMessage(supportSession.id, content);
      setSupportMessagesBySessionId(prev => ({ ...prev, [supportSession.id]: [...(prev[supportSession.id] || []), nextMessage] }));
      setSupportSessions(prev => prev.map(session => session.id === supportSession.id ? { ...session, lastMessageAt: nextMessage.time } : session));
    } catch (error) {
      setInput(content);
      setChatError(error.message || "메시지를 보내지 못했습니다.");
    } finally {
      setIsSending(false);
    }
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
      {chatError && <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{chatError}</p>}

      {supportSession.status !== "RESOLVED" ? (
        <div className="flex gap-2">
          <input className="flex-1 border rounded-xl px-4 py-2 text-sm" placeholder="메시지를 입력하세요..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !isSending && sendMsg()} disabled={isSending} />
          <Button onClick={sendMsg} className="rounded-xl" disabled={isSending}>{isSending ? "전송 중" : <Send size={16} />}</Button>
        </div>
      ) : (
        <div className="text-center text-xs text-gray-400 py-2">상담이 종료되었습니다</div>
      )}
    </div>
  );
};

export default InquiryDetailPage;
