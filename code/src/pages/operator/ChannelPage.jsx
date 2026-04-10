import { useState } from "react";
import { Search, MessageCircle, FileText, Bot, ChevronRight } from "lucide-react";
import { Card, StatusBadge, Avatar, TabButton } from "../../components/ui";
import { MOCK_ORDERS } from "../../data/mockData";
import { generateAISummary } from "../../utils/aiSummary";

const ChannelPage = ({ inquiries, openInquiry }) => {
  const [tab, setTab] = useState("consult");
  const [filter, setFilter] = useState("latest");
  const [searchQ, setSearchQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const list = inquiries
    .filter(i => tab === "consult" ? i.type === "상담" : i.type === "문의")
    .filter(i => !searchQ || i.title.includes(searchQ) || i.storeName.includes(searchQ) || (MOCK_ORDERS.find(o => o.id === i.orderId)?.customerName || "").includes(searchQ))
    .filter(i => !dateFrom || i.createdAt.slice(0, 10) >= dateFrom)
    .filter(i => !dateTo || i.createdAt.slice(0, 10) <= dateTo)
    .sort((a, b) => filter === "latest" ? b.lastMessageAt.localeCompare(a.lastMessageAt) : a.lastMessageAt.localeCompare(b.lastMessageAt));

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">상담·문의 관리</h2>
      <div className="flex border-b mb-4">
        <TabButton active={tab === "consult"} onClick={() => setTab("consult")} icon={MessageCircle}>상담 내역</TabButton>
        <TabButton active={tab === "board"} onClick={() => setTab("board")} icon={FileText}>문의 내역</TabButton>
      </div>
      <div className="flex gap-2 mb-2 flex-wrap">
        <div className="flex-1 relative min-w-[150px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full border rounded-lg pl-8 pr-3 py-1.5 text-sm" placeholder="이름, 제목, 스토어 검색..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        </div>
        <select className="border rounded-lg px-2 py-1.5 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="latest">최신순</option><option value="oldest">오래된순</option>
        </select>
      </div>
      <div className="flex gap-2 mb-4 items-center">
        <span className="text-xs text-gray-500">기간:</span>
        <input type="date" className="border rounded-lg px-2 py-1 text-xs" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <span className="text-xs text-gray-400">~</span>
        <input type="date" className="border rounded-lg px-2 py-1 text-xs" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-red-400 hover:text-red-600">초기화</button>}
      </div>
      <div className="space-y-2">
        {list.map(inq => {
          const order = MOCK_ORDERS.find(o => o.id === inq.orderId);
          return (
            <Card key={inq.id} className="p-3" onClick={() => openInquiry(inq)}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Avatar name={order?.customerName} size="w-6 h-6" bg="bg-blue-100 text-blue-600" />
                  <span className="text-sm font-semibold">{order?.customerName || "고객"}</span>
                  {order && <span className="text-xs text-gray-400">· {order.productName} ({order.orderNumber})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={inq.status} />
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              </div>
              <div className="bg-gray-50 rounded-md px-2.5 py-1.5 mb-1">
                <div className="flex items-start gap-1">
                  <Bot size={12} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600">{generateAISummary(inq)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">{inq.lastMessageAt}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ChannelPage;
