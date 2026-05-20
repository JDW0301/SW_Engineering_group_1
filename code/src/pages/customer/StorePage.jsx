import { ArrowLeft, Store, Phone, MapPin, Clock, Bot, FileText, User } from "lucide-react";
import { Card, TabButton } from "../../components/ui";
import ChatbotTab from "./ChatbotTab";
import ConsultTab from "./ConsultTab";
import BoardTab from "./BoardTab";
import MyInquiryTab from "./MyInquiryTab";

const StorePage = ({ selectedStore, setPage, storeTab, setStoreTab, selectedOrder, onSelectOrder, orders, supportSessions, setSupportSessions, setSupportMessagesBySessionId, inquiryPosts, setInquiryPosts, openSupportSession, openInquiryPost, onCreateSupportFromChatbot, createSupportSession }) => {
  if (!selectedStore) return null;

  const storeOrders = orders.filter(order => order.storeId === selectedStore.id);

  const handleOrderChange = (event) => {
    const orderId = event.target.value;
    onSelectOrder(orderId ? storeOrders.find(order => String(order.id) === orderId) || null : null);
  };

  const handleInquiryCreated = (post) => {
    setInquiryPosts(prev => [post, ...prev.filter(item => item.id !== post.id)]);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <button type="button" onClick={() => setPage("main")} className="flex items-center gap-1 text-sm text-gray-500"><ArrowLeft size={16} /> 뒤로</button>
      </div>
      {/* Store Header */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center"><Store size={24} className="text-indigo-600" /></div>
          <div className="flex-1">
            <h2 className="font-bold text-lg">{selectedStore.name}</h2>
            <p className="text-xs text-gray-500">{selectedStore.category} · {selectedStore.desc}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t text-sm text-gray-600 space-y-1">
          <p className="flex items-center gap-2"><Phone size={14} /> {selectedStore.phone}</p>
          <p className="flex items-center gap-2"><MapPin size={14} /> {selectedStore.address}</p>
          <p className="flex items-center gap-2"><Clock size={14} /> {selectedStore.operatingHours}</p>
        </div>
      </Card>

      <div className="mb-4 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
        <label className="block text-xs font-medium text-gray-500 mb-1">챗봇 문의 대상</label>
        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400" value={selectedOrder?.id || ""} onChange={handleOrderChange}>
          <option value="">스토어 일반 문의</option>
          {storeOrders.map(order => (
            <option key={order.id} value={order.id}>{order.productName} ({order.orderNumber})</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex border-b">
        <TabButton className="min-w-0 flex-1 justify-center" active={storeTab === "chatbot"} onClick={() => setStoreTab("chatbot")} icon={Bot}>챗봇</TabButton>
        <TabButton className="min-w-0 flex-1 justify-center" active={storeTab === "board"} onClick={() => setStoreTab("board")} icon={FileText}>문의 게시판</TabButton>
        <TabButton className="min-w-0 flex-1 justify-center" active={storeTab === "myInquiry"} onClick={() => setStoreTab("myInquiry")} icon={User}>나의 문의</TabButton>
      </div>

      {storeTab === "chatbot" && <ChatbotTab store={selectedStore} selectedOrder={selectedOrder} onCreateSupportFromChatbot={onCreateSupportFromChatbot} />}
      {storeTab === "consult" && <ConsultTab store={selectedStore} order={selectedOrder} orders={orders} supportSessions={supportSessions} setSupportSessions={setSupportSessions} setSupportMessagesBySessionId={setSupportMessagesBySessionId} onOpenSupportSession={openSupportSession} createSupportSession={createSupportSession} />}
      {storeTab === "board" && <BoardTab store={selectedStore} posts={inquiryPosts.filter(p => p.storeId === selectedStore.id)} orders={orders} onInquiryCreated={handleInquiryCreated} />}
      {storeTab === "myInquiry" && <MyInquiryTab store={selectedStore} supportSessions={supportSessions.filter(session => session.storeId === selectedStore.id)} inquiryPosts={inquiryPosts.filter(post => post.storeId === selectedStore.id)} onOpenSupportSession={openSupportSession} onOpenInquiryPost={openInquiryPost} />}
    </div>
  );
};

export default StorePage;
