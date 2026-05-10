import { useState } from "react";
import { Package, Bot, ChevronRight } from "lucide-react";
import { Card, StatusBadge, Avatar } from "../../components/ui";
import { MOCK_ORDERS } from "../../data/mockData";
import { generateAISummary } from "../../utils/aiSummary";
import OrderRow from "./OrderRow";

const toInquiryMessages = (post, replies) => [
  { id: 1, sender: "customer", content: post.content, time: post.createdAt },
  ...replies.map(reply => ({ id: reply.id + 1, sender: "operator", content: reply.content, time: reply.createdAt })),
];

const OperatorMain = ({ supportSessions, supportMessagesBySessionId, inquiryPosts, inquiryRepliesByPostId, openSupportSession, openInquiryPost }) => {
  const [ratePeriod, setRatePeriod] = useState("7일");
  const supportRows = supportSessions.map(session => ({ ...session, kind: "support", messages: supportMessagesBySessionId[session.id] || [] }));
  const inquiryRows = inquiryPosts.map(post => ({ ...post, kind: "inquiry", messages: toInquiryMessages(post, inquiryRepliesByPostId[post.id] || []) }));
  const displayRows = [...supportRows, ...inquiryRows];

  const filterByPeriod = (list, period) => {
    const now = new Date();
    const days = period === "1일" ? 1 : period === "7일" ? 7 : period === "30일" ? 30 : 9999;
    return list.filter(i => {
      const d = new Date(i.createdAt);
      return (now - d) / 86400000 <= days;
    });
  };

  const rateFiltered = filterByPeriod(displayRows, ratePeriod);
  const rateTotal = rateFiltered.length;
  const rateResolved = rateFiltered.filter(i => i.status === "RESOLVED").length;
  const rate = rateTotal ? Math.round((rateResolved / rateTotal) * 100) : 0;
  const avgResponseTime = (() => {
    const times = displayRows.filter(row => row.messages && row.messages.length >= 2).map(row => {
      const fc = row.messages.find(m => m.sender === "customer");
      const fo = row.messages.find(m => m.sender === "operator");
      if (!fc || !fo || !fc.time || !fo.time) return null;
      const diff = new Date(fo.time) - new Date(fc.time);
      return diff > 0 ? diff : null;
    }).filter(Boolean);
    if (times.length === 0) return "N/A";
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length / 60000) + "분";
  })();

  return (
    <div className="space-y-6">
      {/* 문의 상담 관리 */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-3">문의 상담 관리</h3>
        <p className="text-xs font-medium text-gray-500 mb-2">최근 상담</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...supportRows].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)).slice(0, 5).map(session => {
            const order = MOCK_ORDERS.find(o => o.id === session.orderId);
            return (
              <Card key={session.id} className="p-3" onClick={() => openSupportSession(session.id)}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Avatar name={order?.customerName} size="w-6 h-6" bg="bg-blue-100 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-800">{order?.customerName || "고객"}</span>
                  </div>
                  <StatusBadge status={session.status} />
                </div>
                {order && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Package size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{order.productName} · {order.orderNumber}</span>
                  </div>
                )}
                <div className="bg-gray-50 rounded-md px-2.5 py-1.5 mb-1.5">
                  <div className="flex items-start gap-1">
                    <Bot size={12} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600 leading-relaxed">{generateAISummary(session)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">최근: {session.lastMessageAt}</p>
              </Card>
            );
          })}
        </div>
        <p className="text-xs font-medium text-gray-500 mt-5 mb-2">최근 문의</p>
        {[...inquiryRows].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)).slice(0, 5).map(post => {
          const order = MOCK_ORDERS.find(o => o.id === post.orderId);
          return (
            <Card key={post.id} className="p-3 mb-2" onClick={() => openInquiryPost(post.id)}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Avatar name={order?.customerName} size="w-6 h-6" bg="bg-emerald-100 text-emerald-600" />
                  <span className="text-sm font-semibold text-gray-800">{order?.customerName || "고객"}</span>
                  {order && <span className="text-xs text-gray-400">· {order.productName}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={post.status} />
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              </div>
              <div className="bg-gray-50 rounded-md px-2.5 py-1.5">
                <div className="flex items-start gap-1">
                  <Bot size={12} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600">{generateAISummary(post)}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      {/* Orders */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-3">최근 주문 목록</h3>
        {MOCK_ORDERS.filter(o => o.storeId === 1).slice(0, 10).map(o => (
          <OrderRow key={o.id} order={o} supportSessions={supportSessions} inquiryPosts={inquiryPosts} onOpenSupportSession={openSupportSession} onOpenInquiryPost={openInquiryPost} />
        ))}
      </section>

      {/* Stats */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-3">통계</h3>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
          <Card className="p-4 min-h-48 min-w-[280px] flex flex-col items-center justify-center text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray={`${rate} ${100 - rate}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{rateResolved}/{rateTotal}</div>
            </div>
            <p className="text-xs text-gray-500">상담·문의 완료율</p>
            <div className="flex justify-center gap-1 mt-3">
              {["7일", "30일", "전체"].map(l => <button key={l} onClick={() => setRatePeriod(l)} className={`text-xs px-2 py-0.5 rounded ${ratePeriod === l ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}>{l}</button>)}
            </div>
          </Card>
          <Card className="p-4 min-h-48 min-w-[280px] flex flex-col items-center justify-center text-center">
            <p className="text-3xl font-bold text-indigo-600 mb-1">{displayRows.filter(i => i.status !== "RESOLVED").length}</p>
            <p className="text-xs text-gray-500">대기 문의</p>
          </Card>
          <Card className="p-4 min-h-48 min-w-[280px] flex flex-col items-center justify-center text-center">
            <p className="text-3xl font-bold text-green-600 mb-1">{avgResponseTime}</p>
            <p className="text-xs text-gray-500">평균 첫 응답시간</p>
          </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OperatorMain;
