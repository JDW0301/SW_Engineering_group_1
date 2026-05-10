import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { MOCK_STORES, MOCK_ORDERS } from "../../data/mockData";
import OrderSummaryCard from "./OrderSummaryCard";

const OrdersPage = ({ setPage, openStore, setSelectedOrder, orders = MOCK_ORDERS, stores = MOCK_STORES }) => {
  const [filter, setFilter] = useState("latest");
  const [storeFilter, setStoreFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const orderList = orders.length > 0 ? orders : MOCK_ORDERS;
  const storeList = stores.length > 0 ? stores : MOCK_STORES;
  const sorted = [...orderList]
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
          {storeList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="date" className="border rounded-lg px-3 py-1.5 text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="시작일" />
        <input type="date" className="border rounded-lg px-3 py-1.5 text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="종료일" />
      </div>
      <div className="space-y-2">
        {sorted.map(o => (
          <OrderSummaryCard key={o.id} order={o} onClick={() => { const s = storeList.find(store => store.id === o.storeId); if (s) { setSelectedOrder(o); openStore(s, "chatbot", o); } }} />
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
