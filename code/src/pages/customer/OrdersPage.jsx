import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Card } from "../../components/ui";
import { MOCK_STORES, MOCK_ORDERS } from "../../data/mockData";

const OrdersPage = ({ setPage, openStore, setSelectedOrder }) => {
  const [filter, setFilter] = useState("latest");
  const [storeFilter, setStoreFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const sorted = [...MOCK_ORDERS]
    .filter(o => storeFilter === "all" || o.storeId === parseInt(storeFilter))
    .filter(o => !dateFrom || o.orderedAt >= dateFrom)
    .filter(o => !dateTo || o.orderedAt <= dateTo)
    .sort((a, b) => filter === "latest" ? b.orderedAt.localeCompare(a.orderedAt) : a.orderedAt.localeCompare(b.orderedAt));

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setPage("main")} className="p-1"><ArrowLeft size={20} /></button>
        <h2 className="text-lg font-bold">주문 목록</h2>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <select className="border rounded-lg px-3 py-1.5 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="latest">최신순</option><option value="oldest">오래된순</option>
        </select>
        <select className="border rounded-lg px-3 py-1.5 text-sm" value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
          <option value="all">전체 스토어</option>
          {MOCK_STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="date" className="border rounded-lg px-3 py-1.5 text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="시작일" />
        <input type="date" className="border rounded-lg px-3 py-1.5 text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="종료일" />
      </div>
      <div className="space-y-2">
        {sorted.map(o => (
          <Card key={o.id} className="p-4" onClick={() => { const s = MOCK_STORES.find(s => s.id === o.storeId); if (s) { setSelectedOrder(o); openStore(s, "consult"); } }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-mono">{o.orderNumber}</span>
              <span className="text-xs text-gray-400">{o.orderedAt}</span>
            </div>
            <p className="font-medium text-sm">{o.productName} <span className="text-gray-400">x{o.quantity}</span></p>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">{o.storeName}</span>
              <span className="text-sm font-semibold">{o.totalPrice.toLocaleString()}원</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
