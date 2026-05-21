import { useState, useEffect, useRef } from "react";
import { Send, ArrowRight, X } from "lucide-react";
import { Avatar, Button, Card, Input } from "../../components/ui";
import { streamChatbotReply } from "../../api/ai";
import { listStoreFaqs } from "../../api/faqs";

const buildStoreContext = (store, order) => [
  `스토어명: ${store.name}`,
  `카테고리: ${store.category ?? "미정"}`,
  `소개: ${store.desc ?? store.description ?? "정보 없음"}`,
  `전화번호: ${store.phone ?? "정보 없음"}`,
  `주소: ${store.address ?? "정보 없음"}`,
  `영업시간: ${store.operatingHours ?? store.businessHours ?? "정보 없음"}`,
  ...(order ? [
    `선택 주문번호: ${order.orderNumber}`,
    `선택 상품명: ${order.productName}`,
    `선택 주문수량: ${order.quantity ?? "정보 없음"}`,
    `선택 주문일: ${order.orderedAt ?? "정보 없음"}`,
    `선택 주문금액: ${order.totalPrice?.toLocaleString?.() ?? order.totalPrice ?? "정보 없음"}원`,
  ] : []),
].join("\n");

const buildIntroMessage = (store, order) => order
  ? `${store.name} 챗봇입니다. 선택하신 ${order.productName} (${order.orderNumber}) 주문 문의를 도와드릴게요.`
  : `${store.name}에 오신 것을 환영합니다! 무엇을 도와드릴까요?`;

const formatOrderPrice = (order) => {
  const price = order.totalPrice?.toLocaleString?.() ?? order.totalPrice;
  return price ? `${price}원` : null;
};

const getOrderDetails = (order) => [
  order.quantity ? `${order.quantity}개` : null,
  order.orderedAt,
  formatOrderPrice(order),
].filter(Boolean).join(" · ");

const toAiHistory = (messages) => messages
  .filter(message => message.sender === "user" || message.sender === "bot")
  .slice(-20)
  .map(message => ({
    role: message.sender === "user" ? "customer" : "bot",
    content: message.content,
  }));

const ChatbotTab = ({ store, selectedOrder, storeOrders = [], onSelectOrder, onCreateSupportFromChatbot }) => {
  const [messages, setMessages] = useState([{ id: 0, sender: "bot", content: buildIntroMessage(store, selectedOrder) }]);
  const [input, setInput] = useState("");
  const [showFaq, setShowFaq] = useState(true);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [needsHandoff, setNeedsHandoff] = useState(false);
  const [isHandoffOpen, setIsHandoffOpen] = useState(false);
  const [handoffTitle, setHandoffTitle] = useState("");
  const [handoffContent, setHandoffContent] = useState("");
  const [handoffError, setHandoffError] = useState("");
  const [isHandoffSubmitting, setIsHandoffSubmitting] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [isFaqLoading, setIsFaqLoading] = useState(true);
  const chatEnd = useRef(null);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    setMessages([{ id: 0, sender: "bot", content: buildIntroMessage(store, selectedOrder) }]);
    setInput("");
    setShowFaq(true);
    setStatus("");
    setError("");
    setIsContextOpen(false);
    setNeedsHandoff(false);
    setIsHandoffOpen(false);
    setHandoffTitle("");
    setHandoffContent("");
    setHandoffError("");
    setIsHandoffSubmitting(false);
  }, [store.id, store.name, selectedOrder?.id, selectedOrder?.productName, selectedOrder?.orderNumber]);

  useEffect(() => {
    let ignore = false;
    setIsFaqLoading(true);
    listStoreFaqs(store.id)
      .then(items => {
        if (!ignore) setFaqs(items);
      })
      .catch(() => {
        if (!ignore) setFaqs([]);
      })
      .finally(() => {
        if (!ignore) setIsFaqLoading(false);
      });
    return () => { ignore = true; };
  }, [store.id]);

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
          storeId: store.id,
          message: trimmed,
          history: toAiHistory(nextMessages),
          store_context: buildStoreContext(store, selectedOrder),
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
    const now = Date.now();
    setMessages(prev => [
      ...prev,
      { id: now, sender: "user", content: faq.question },
      { id: now + 1, sender: "bot", content: faq.answer },
    ]);
    setError("");
    setStatus("");
    setNeedsHandoff(false);
  };

  const requestHandoff = () => {
    const latestUserMessage = [...messages].reverse().find(message => message.sender === "user");
    setHandoffTitle("");
    setHandoffContent(latestUserMessage?.content ?? "");
    setHandoffError("");
    setIsHandoffOpen(true);
  };

  const selectContextOrder = (order) => {
    onSelectOrder(order);
    setIsContextOpen(false);
  };

  const selectedContextLabel = selectedOrder
    ? `${selectedOrder.productName} · ${selectedOrder.orderNumber}`
    : "스토어 일반 문의";
  const orderedStoreOrders = [...storeOrders].sort((firstOrder, secondOrder) => secondOrder.orderedAt.localeCompare(firstOrder.orderedAt));

  const closeHandoff = () => {
    if (isHandoffSubmitting) return;
    setIsHandoffOpen(false);
    setHandoffTitle("");
    setHandoffContent("");
    setHandoffError("");
  };

  const confirmHandoff = async (event) => {
    event.preventDefault();
    const title = handoffTitle.trim();
    const content = handoffContent.trim();
    if (!title || !content) {
      setHandoffError("문의명과 문의 내용을 모두 입력해 주세요.");
      return;
    }

    setHandoffError("");
    setIsHandoffSubmitting(true);
    try {
      const latestUserMessage = [...messages].reverse().find(message => message.sender === "user");
      const handoffMessages = latestUserMessage?.content?.trim() === content
        ? messages
        : [...messages, { id: Date.now(), sender: "user", content }];
      await onCreateSupportFromChatbot({ title, store, messages: handoffMessages, order: selectedOrder });
    } catch (handoffCreateError) {
      setHandoffError(handoffCreateError.message || "상담 요청을 접수하지 못했습니다.");
      setIsHandoffSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: "60vh" }}>
      <div className="mb-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-indigo-600">현재 문의 대상</p>
            <p className="truncate text-sm font-semibold text-gray-900">{selectedContextLabel}</p>
          </div>
          <button type="button" onClick={() => setIsContextOpen(open => !open)} className="shrink-0 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition">
            변경
          </button>
        </div>
        {isContextOpen && (
          <div className="mt-2 space-y-1 border-t border-indigo-100 pt-2">
            <button type="button" onClick={() => selectContextOrder(null)} className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${!selectedOrder ? "bg-white text-indigo-700" : "text-gray-700 hover:bg-white"}`}>
              스토어 일반 문의
            </button>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {orderedStoreOrders.map(order => {
                const details = getOrderDetails(order);
                return (
                  <button key={order.id} type="button" onClick={() => selectContextOrder(order)} className={`w-full rounded-lg px-3 py-2 text-left transition ${selectedOrder?.id === order.id ? "bg-white text-indigo-700" : "text-gray-700 hover:bg-white"}`}>
                    <span className="block truncate text-sm font-medium">{order.productName} · {order.orderNumber}</span>
                    {details && <span className="mt-0.5 block truncate text-xs text-gray-500">{details}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            {m.sender === "bot" && <Avatar name={store.name} bg="bg-green-100 text-green-600" />}
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
          {isFaqLoading && <p className="text-xs text-gray-400 px-3 py-2">질문을 불러오는 중입니다.</p>}
          {!isFaqLoading && faqs.length === 0 && <p className="text-xs text-gray-400 px-3 py-2">등록된 질문이 없습니다.</p>}
          {faqs.map(f => (
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
      {isHandoffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/35 px-4">
          <Card className="w-full max-w-sm p-4 shadow-lg">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">상담사 연결</h3>
                <p className="text-xs text-gray-500 mt-1">챗봇 대화와 함께 전달할 문의 정보를 입력해 주세요.</p>
              </div>
              <button type="button" onClick={closeHandoff} disabled={isHandoffSubmitting} className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50">
                <X size={18} />
              </button>
            </div>
            {selectedOrder && (
              <div className="mb-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                참조 주문: {selectedOrder.productName} ({selectedOrder.orderNumber})
              </div>
            )}
            <form className="space-y-3" onSubmit={confirmHandoff}>
              <Input label="문의명" value={handoffTitle} onChange={event => setHandoffTitle(event.target.value)} placeholder={selectedOrder ? `${selectedOrder.productName} 관련 상담` : `${store.name} 상담`} disabled={isHandoffSubmitting} autoFocus />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">문의 내용</label>
                <textarea className="border border-gray-300 rounded-lg px-3 py-2 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 disabled:bg-gray-50 disabled:text-gray-500" value={handoffContent} onChange={event => setHandoffContent(event.target.value)} placeholder="상담사에게 전달할 내용을 작성하세요" disabled={isHandoffSubmitting} />
              </div>
              {handoffError && <p className="text-xs text-red-500">{handoffError}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" size="sm" onClick={closeHandoff} disabled={isHandoffSubmitting} className="disabled:cursor-not-allowed disabled:opacity-50">취소</Button>
                <Button type="submit" size="sm" disabled={isHandoffSubmitting} className="disabled:cursor-not-allowed disabled:opacity-60">{isHandoffSubmitting ? "접수 중..." : "확인"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChatbotTab;
