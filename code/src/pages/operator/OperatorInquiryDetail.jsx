import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, User, Phone, Package, Clipboard, Star, HelpCircle } from "lucide-react";
import { Card, StatusBadge, Avatar, Button, BoardDetail } from "../../components/ui";
import { createSupportMessage, listSupportMessages, updateSupportStatus } from "../../api/support";
import { createInquiryReply, createInternalNote } from "../../api/operatorWorkspace";

const OperatorInquiryDetail = ({ selectedDetail, supportSessions, setSupportSessions, supportMessagesBySessionId, setSupportMessagesBySessionId, inquiryPosts, setInquiryPosts, inquiryRepliesByPostId, setInquiryRepliesByPostId, setPage, prevPage, orders, notesByTarget, setNotesByTarget, presets = [] }) => {
  const [input, setInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatEnd = useRef(null);
  const supportSession = selectedDetail?.kind === "support" ? supportSessions.find(session => session.id === selectedDetail.id) : null;
  const inquiryPost = selectedDetail?.kind === "inquiry" ? inquiryPosts.find(post => post.id === selectedDetail.id) : null;
  const detail = supportSession || inquiryPost;
  const supportMessages = supportSession ? supportMessagesBySessionId[supportSession.id] || [] : [];
  const inquiryReplies = inquiryPost ? inquiryRepliesByPostId[inquiryPost.id] || [] : [];
  const noteKey = selectedDetail ? `${selectedDetail.kind}-${selectedDetail.id}` : "";
  const notes = notesByTarget[noteKey] || [];
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

  if (!detail) return null;

  const order = orders.find(o => o.id === detail.orderId);
  const customerInfo = order || detail;

  const sendMsg = async () => {
    if (!supportSession) return;
    if (!input.trim()) return;
    const content = input.trim();
    setInput("");
    setIsSending(true);
    setChatError("");
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

  const changeStatus = async (status) => {
    if (!supportSession) return;
    const updated = await updateSupportStatus(supportSession.id, status);
    setSupportSessions(prev => prev.map(session => session.id === supportSession.id ? updated : session));
  };

  const addNote = async () => {
    if (!noteInput.trim()) return;
    const note = await createInternalNote({
      supportSessionId: supportSession?.id || null,
      inquiryPostId: inquiryPost?.id || null,
      content: noteInput,
    });
    setNotesByTarget(prev => ({ ...prev, [noteKey]: [...(prev[noteKey] || []), note] }));
    setNoteInput("");
  };

  const handleAnswerSubmit = async (answer) => {
    if (!inquiryPost) return;
    const nextReply = await createInquiryReply(inquiryPost.id, answer);
    setInquiryRepliesByPostId(prev => ({ ...prev, [inquiryPost.id]: [...inquiryReplies, nextReply] }));
    setInquiryPosts(prev => prev.map(post => post.id === inquiryPost.id ? { ...post, status: "RESOLVED", lastMessageAt: nextReply.createdAt } : post));
  };

  const inquiryForBoard = inquiryPost ? {
    ...inquiryPost,
    messages: [
      { id: 1, sender: "customer", content: inquiryPost.content, time: inquiryPost.createdAt },
      ...inquiryReplies.map(reply => ({ id: reply.id + 1, sender: "operator", content: reply.content, time: reply.createdAt })),
    ],
  } : null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setPage(prevPage || "main")}><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <h3 className="font-bold">{detail.title}</h3>
          <p className="text-xs text-gray-500">#{detail.id} · {detail.storeName} · {selectedDetail.kind === "support" ? "상담" : "문의"}</p>
        </div>
        <StatusBadge status={detail.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Customer & Order Info */}
          {(order || customerInfo?.customerName) && (
            <Card className="p-3 mb-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><User size={12} /> 고객 정보</p>
                  <div className="text-sm space-y-0.5">
                    <p className="font-medium">{customerInfo.customerName}</p>
                    <p className="text-gray-500 flex items-center gap-1"><Phone size={11} /> {customerInfo.phone}</p>
                  </div>
                </div>
                {order && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Package size={12} /> 주문 정보</p>
                    <div className="text-sm space-y-0.5">
                      <p>{order.productName} x{order.quantity}</p>
                      <p className="text-gray-500">{order.orderNumber} · {order.orderedAt}</p>
                      <p className="font-medium">{order.totalPrice.toLocaleString()}원</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {selectedDetail.kind === "inquiry" ? (
            <BoardDetail 
              inquiry={inquiryForBoard} 
              onBack={() => setPage(prevPage || "main")} 
              isOperator={true} 
              onAnswerSubmit={handleAnswerSubmit}
            />
          ) : (
            <>
              {/* Messages */}
              <Card className="p-4" style={{ height: "50vh" }}>
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                    {supportMessages.map(m => (
                      <div key={m.id} className={`flex ${m.sender === "operator" ? "justify-end" : m.sender === "system" ? "justify-center" : "justify-start"}`}>
                        {m.sender === "system" ? (
                          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{m.content}</span>
                        ) : (
                          <>
                            {m.sender === "customer" && <Avatar name="고" bg="bg-blue-100 text-blue-600" />}
                            <div className={`max-w-sm mx-2 px-3 py-2 rounded-2xl text-sm ${m.sender === "operator" ? "bg-indigo-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
                              {m.content}
                              {m.time && <p className={`text-xs mt-1 ${m.sender === "operator" ? "text-indigo-200" : "text-gray-400"}`}>{m.time}</p>}
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
                      <input className="flex-1 border rounded-xl px-4 py-2 text-sm" placeholder="답변을 입력하세요..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !isSending && sendMsg()} disabled={isSending} />
                      <Button onClick={sendMsg} className="rounded-xl" disabled={isSending}>{isSending ? "전송 중" : <Send size={16} />}</Button>
                    </div>
                  ) : (
                    <p className="text-center text-xs text-gray-400">해결된 상담입니다</p>
                  )}
                </div>
              </Card>

              {/* Status Controls */}
              <div className="flex flex-wrap gap-2 mt-3">
                {["IN_PROGRESS", "RESOLVED"].map(s => (
                  <Button key={s} size="sm" variant={supportSession.status === s ? "primary" : "outline"} onClick={() => changeStatus(s)}>
                    {s === "IN_PROGRESS" ? "진행 중" : "해결"}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Internal Notes */}
          <Card className="p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-1"><Clipboard size={14} /> 내부 메모</h4>
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {notes.length === 0 ? <p className="text-xs text-gray-400">메모가 없습니다</p> :
                notes.map(n => (
                  <div key={n.id} className="bg-yellow-50 rounded p-2 text-xs">
                    <p>{n.content}</p>
                    <p className="text-gray-400 mt-1">{n.time}</p>
                  </div>
                ))
              }
            </div>
            <div className="flex gap-1">
              <input className="flex-1 border rounded px-2 py-1 text-xs" placeholder="메모 입력..." value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} />
              <Button size="sm" onClick={addNote}>추가</Button>
            </div>
          </Card>

          {/* AI Summary */}
          <Card className="p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1"><Star size={14} /> AI 요약</h4>
            <p className="text-xs text-gray-600 leading-relaxed">고객이 {order?.productName || "상품"} 관련하여 문의했습니다. 주요 이슈는 사이즈 교환/제품 문의이며, 현재 {detail.status === "RESOLVED" ? "해결" : "처리 중"}입니다.</p>
          </Card>

          {/* Quick Presets */}
          <Card className="p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1"><HelpCircle size={14} /> 빠른 답변</h4>
            <div className="space-y-1">
              {presets.map((preset) => (
                <button key={preset.id} onClick={() => setInput(preset.content)} className="block w-full text-left px-2 py-1.5 bg-gray-50 rounded text-xs hover:bg-gray-100 transition">{preset.title}</button>
              ))}
              {presets.length === 0 && <p className="text-xs text-gray-400">저장된 프리셋이 없습니다</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OperatorInquiryDetail;
