import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, User, Phone, Package, Clipboard, Star, HelpCircle } from "lucide-react";
import { Card, StatusBadge, Avatar, Button } from "../../components/ui";
import { MOCK_ORDERS } from "../../data/mockData";

const OperatorInquiryDetail = ({ selectedInquiry, setSelectedInquiry, inquiries, setInquiries, setPage, prevPage }) => {
  const [input, setInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState([]);
  const chatEnd = useRef(null);
  const inq = selectedInquiry;
  if (!inq) return null;
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [inq?.messages]);

  const order = MOCK_ORDERS.find(o => o.id === inq.orderId);

  const sendMsg = () => {
    if (!input.trim()) return;
    const updated = { ...inq, messages: [...inq.messages, { id: inq.messages.length + 1, sender: "operator", content: input, time: new Date().toLocaleString() }], lastMessageAt: new Date().toLocaleString() };
    setSelectedInquiry(updated);
    setInquiries(p => p.map(i => i.id === inq.id ? updated : i));
    setInput("");
  };

  const changeStatus = (status) => {
    const updated = { ...inq, status };
    setSelectedInquiry(updated);
    setInquiries(p => p.map(i => i.id === inq.id ? updated : i));
  };

  const addNote = () => {
    if (!noteInput.trim()) return;
    setNotes(p => [...p, { id: p.length + 1, content: noteInput, time: new Date().toLocaleString() }]);
    setNoteInput("");
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setPage(prevPage || "main")}><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <h3 className="font-bold">{inq.title}</h3>
          <p className="text-xs text-gray-500">#{inq.id} · {inq.storeName} · {inq.type}</p>
        </div>
        <StatusBadge status={inq.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chat */}
        <div className="lg:col-span-2">
          {/* Customer & Order Info */}
          {order && (
            <Card className="p-3 mb-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><User size={12} /> 고객 정보</p>
                  <div className="text-sm space-y-0.5">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-gray-500 flex items-center gap-1"><Phone size={11} /> {order.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Package size={12} /> 주문 정보</p>
                  <div className="text-sm space-y-0.5">
                    <p>{order.productName} x{order.quantity}</p>
                    <p className="text-gray-500">{order.orderNumber} · {order.orderedAt}</p>
                    <p className="font-medium">{order.totalPrice.toLocaleString()}원</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Messages */}
          <Card className="p-4" style={{ height: "50vh" }}>
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                {inq.messages.map(m => (
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
              {inq.status !== "RESOLVED" ? (
                <div className="flex gap-2">
                  <input className="flex-1 border rounded-xl px-4 py-2 text-sm" placeholder="답변을 입력하세요..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} />
                  <Button onClick={sendMsg} className="rounded-xl"><Send size={16} /></Button>
                </div>
              ) : (
                <p className="text-center text-xs text-gray-400">해결된 문의입니다</p>
              )}
            </div>
          </Card>

          {/* Status Controls */}
          <div className="flex flex-wrap gap-2 mt-3">
            {["IN_PROGRESS", "RESOLVED"].map(s => (
              <Button key={s} size="sm" variant={inq.status === s ? "primary" : "outline"} onClick={() => changeStatus(s)}>
                {s === "IN_PROGRESS" ? "진행 중" : "해결"}
              </Button>
            ))}
          </div>
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
            <p className="text-xs text-gray-600 leading-relaxed">고객이 {order?.productName || "상품"} 관련하여 문의했습니다. 주요 이슈는 사이즈 교환/제품 문의이며, 현재 {inq.status === "RESOLVED" ? "해결" : "처리 중"}입니다.</p>
          </Card>

          {/* Quick Presets */}
          <Card className="p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1"><HelpCircle size={14} /> 빠른 답변</h4>
            <div className="space-y-1">
              {["교환/반품은 7일 이내 가능합니다.", "배송은 1~3 영업일 소요됩니다.", "확인 후 안내드리겠습니다."].map((preset, i) => (
                <button key={i} onClick={() => setInput(preset)} className="block w-full text-left px-2 py-1.5 bg-gray-50 rounded text-xs hover:bg-gray-100 transition">{preset}</button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OperatorInquiryDetail;
