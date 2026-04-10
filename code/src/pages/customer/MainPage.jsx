import { ChevronRight, Package, Store, MessageCircle } from "lucide-react";
import { Card, StatusBadge } from "../../components/ui";
import { MOCK_STORES, MOCK_ORDERS } from "../../data/mockData";

const MainPage = ({ setPage, openStore, inquiries, openInquiry }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">안녕하세요, 재철님</h2>
      <p className="text-sm text-gray-500">무엇을 도와드릴까요?</p>
    </div>

    {/* 최근 주문 */}
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">최근 주문</h3>
        <button onClick={() => setPage("orders")} className="text-xs text-indigo-600 flex items-center gap-0.5">주문 목록 <ChevronRight size={14} /></button>
      </div>
      <div className="space-y-2">
        {[...MOCK_ORDERS].sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)).slice(0, 5).map(o => (
          <Card key={o.id} className="p-3 flex items-center justify-between" onClick={() => { const s = MOCK_STORES.find(s => s.id === o.storeId); if (s) { openStore(s, "consult", o); } }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center"><Package size={18} className="text-indigo-500" /></div>
              <div>
                <p className="text-sm font-medium text-gray-900">{o.productName}</p>
                <p className="text-xs text-gray-500">{o.storeName} · {o.orderedAt}</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-700">{o.totalPrice.toLocaleString()}원</span>
          </Card>
        ))}
      </div>
    </section>

    {/* 주문 스토어 */}
    <section>
      <h3 className="font-semibold text-gray-800 mb-3">주문했던 스토어</h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {MOCK_STORES.map(s => (
          <Card key={s.id} className="p-3 flex-shrink-0 w-36 text-center" onClick={() => openStore(s)}>
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2"><Store size={20} className="text-indigo-500" /></div>
            <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
            <p className="text-xs text-gray-400">{s.category}</p>
          </Card>
        ))}
      </div>
    </section>

    {/* 진행중 상담 */}
    <section>
      <h3 className="font-semibold text-gray-800 mb-3">진행 중인 상담</h3>
      {inquiries.filter(i => i.status !== "RESOLVED").length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">진행 중인 상담이 없습니다</p>
      ) : inquiries.filter(i => i.status !== "RESOLVED").sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)).slice(0, 5).map(inq => (
        <Card key={inq.id} className="p-3 mb-2" onClick={() => openInquiry(inq)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle size={18} className="text-indigo-500" />
              <div>
                <p className="text-sm font-medium">{inq.title}</p>
                <p className="text-xs text-gray-500">{inq.storeName}</p>
              </div>
            </div>
            <StatusBadge status={inq.status} />
          </div>
        </Card>
      ))}
    </section>

    {/* 최근 문의 */}
    <section>
      <h3 className="font-semibold text-gray-800 mb-3">최근 문의</h3>
      {[...inquiries].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)).slice(0, 5).map(inq => (
        <Card key={inq.id} className="p-3 mb-2" onClick={() => openInquiry(inq)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{inq.title}</p>
              <p className="text-xs text-gray-500">{inq.lastMessageAt}</p>
            </div>
            <StatusBadge status={inq.status} />
          </div>
        </Card>
      ))}
    </section>
  </div>
);

export default MainPage;
