import { useState } from "react";
import { ChevronRight, Store, MessageCircle, FileText } from "lucide-react";
import { Card, StatusBadge, Button } from "../../components/ui";
import { MOCK_STORES } from "../../data/mockData";
import OrderSummaryCard from "./OrderSummaryCard";

const MainPage = ({ setPage, openStore, supportSessions, inquiryPosts, openSupportSession, openInquiryPost, user, orders, stores, isHomeLoading, homeError }) => {
  const [includeResolved, setIncludeResolved] = useState(false);
  const [includeResolvedInquiries, setIncludeResolvedInquiries] = useState(false);
  const visibleSupportSessions = supportSessions
    .filter(session => includeResolved || session.status !== "RESOLVED")
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  const recentInquiryPosts = inquiryPosts
    .filter(post => includeResolvedInquiries || post.status !== "RESOLVED")
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
    .slice(0, 5);
  const displayStores = MOCK_STORES.length > 0 ? MOCK_STORES : stores;
  const findOrderStore = (order) => stores.find(store => store.id === order.storeId)
    || displayStores.find(store => store.id === order.storeId)
    || displayStores.find(store => store.name === order.storeName);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">안녕하세요, {user?.name || "고객"}님</h2>
        <p className="text-sm text-gray-500">무엇을 도와드릴까요?</p>
      </div>

      {isHomeLoading && <p className="text-sm text-gray-400">홈 데이터를 불러오는 중입니다.</p>}
      {homeError && <p className="text-sm text-red-500">{homeError}</p>}

      {/* 최근 주문 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">최근 주문</h3>
          <button onClick={() => setPage("orders")} className="text-xs text-indigo-600 flex items-center gap-0.5">주문 목록 <ChevronRight size={14} /></button>
        </div>
        <div className="space-y-2">
          {orders.length === 0 ? <p className="text-sm text-gray-400 py-4 text-center">주문 내역이 없습니다</p> : [...orders].sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)).slice(0, 5).map(o => (
            <OrderSummaryCard key={o.id} order={o} onClick={() => { const s = findOrderStore(o); if (s) { openStore(s, "chatbot", o); } }} />
          ))}
        </div>
      </section>

      {/* 주문 스토어 */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-3">주문했던 스토어</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayStores.length === 0 ? <p className="text-sm text-gray-400 py-4">스토어 데이터가 없습니다</p> : displayStores.map(s => (
            <Card key={s.id} className="p-3 flex-shrink-0 w-36 text-center" onClick={() => openStore(s)}>
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2"><Store size={20} className="text-indigo-500" /></div>
              <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
              <p className="text-xs text-gray-400">{s.category}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 최근 상담 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">최근 상담</h3>
          <button onClick={() => setPage("supportList")} className="text-xs text-indigo-600 flex items-center gap-0.5">상담 목록 <ChevronRight size={14} /></button>
        </div>
        <div className="flex gap-2 mb-3">
          <Button variant={!includeResolved ? "primary" : "outline"} size="sm" onClick={() => setIncludeResolved(false)}>진행 중</Button>
          <Button variant={includeResolved ? "primary" : "outline"} size="sm" onClick={() => setIncludeResolved(true)}>완료 포함</Button>
        </div>
        <div className="space-y-2">
          {visibleSupportSessions.length === 0 ? <p className="text-sm text-gray-400 py-4 text-center">진행 중인 상담이 없습니다</p> : visibleSupportSessions.slice(0, 5).map(session => (
            <Card key={session.id} className="p-3" onClick={() => openSupportSession(session.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle size={18} className="text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium">{session.title}</p>
                    <p className="text-xs text-gray-500">{session.storeName} · {session.lastMessageAt}</p>
                  </div>
                </div>
                <StatusBadge status={session.status} />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 최근 문의 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">최근 문의</h3>
          <button onClick={() => setPage("inquiryList")} className="text-xs text-indigo-600 flex items-center gap-0.5">문의 목록 <ChevronRight size={14} /></button>
        </div>
        <div className="flex gap-2 mb-3">
          <Button variant={!includeResolvedInquiries ? "primary" : "outline"} size="sm" onClick={() => setIncludeResolvedInquiries(false)}>진행 중</Button>
          <Button variant={includeResolvedInquiries ? "primary" : "outline"} size="sm" onClick={() => setIncludeResolvedInquiries(true)}>완료 포함</Button>
        </div>
        <div className="space-y-2">
          {recentInquiryPosts.length === 0 ? <p className="text-sm text-gray-400 py-4 text-center">최근 문의가 없습니다</p> : recentInquiryPosts.map(post => (
            <Card key={post.id} className="p-3" onClick={() => openInquiryPost(post.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">{post.title}</p>
                    <p className="text-xs text-gray-500">{post.storeName} · {post.lastMessageAt}</p>
                  </div>
                </div>
                <StatusBadge status={post.status} />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MainPage;
