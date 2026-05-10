import { ArrowLeft, Store, Phone, MapPin, Clock, Bot, FileText, User } from "lucide-react";
import { Card, TabButton } from "../../components/ui";
import ChatbotTab from "./ChatbotTab";
import ConsultTab from "./ConsultTab";
import BoardTab from "./BoardTab";
import MyInquiryTab from "./MyInquiryTab";
import { MOCK_BOARD_POSTS } from "../../data/mockData";

const StorePage = ({ selectedStore, setPage, storeTab, setStoreTab, selectedOrder, supportSessions, setSupportSessions, setSupportMessagesBySessionId, inquiryPosts, openSupportSession, openInquiryPost, onCreateSupportFromChatbot, createSupportSession }) => {
  if (!selectedStore) return null;

  const boardPosts = MOCK_BOARD_POSTS;

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

      {/* Tabs */}
      <div className="mb-4 flex border-b">
        <TabButton className="min-w-0 flex-1 justify-center" active={storeTab === "chatbot"} onClick={() => setStoreTab("chatbot")} icon={Bot}>챗봇</TabButton>
        <TabButton className="min-w-0 flex-1 justify-center" active={storeTab === "board"} onClick={() => setStoreTab("board")} icon={FileText}>문의 게시판</TabButton>
        <TabButton className="min-w-0 flex-1 justify-center" active={storeTab === "myInquiry"} onClick={() => setStoreTab("myInquiry")} icon={User}>나의 문의</TabButton>
      </div>

      {storeTab === "chatbot" && <ChatbotTab store={selectedStore} onCreateSupportFromChatbot={onCreateSupportFromChatbot} />}
      {storeTab === "consult" && <ConsultTab store={selectedStore} order={selectedOrder} supportSessions={supportSessions} setSupportSessions={setSupportSessions} setSupportMessagesBySessionId={setSupportMessagesBySessionId} onOpenSupportSession={openSupportSession} createSupportSession={createSupportSession} />}
      {storeTab === "board" && <BoardTab store={selectedStore} posts={boardPosts.filter(p => p.storeId === selectedStore.id)} />}
      {storeTab === "myInquiry" && <MyInquiryTab store={selectedStore} supportSessions={supportSessions.filter(session => session.storeId === selectedStore.id)} inquiryPosts={inquiryPosts.filter(post => post.storeId === selectedStore.id)} onOpenSupportSession={openSupportSession} onOpenInquiryPost={openInquiryPost} />}
    </div>
  );
};

export default StorePage;
