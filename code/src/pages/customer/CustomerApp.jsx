import { useEffect, useState } from "react";
import { getCustomerHome } from "../../api/customerHome";
import { MOCK_INQUIRY_POSTS, MOCK_INQUIRY_REPLIES_BY_POST_ID, MOCK_SUPPORT_MESSAGES_BY_SESSION_ID, MOCK_SUPPORT_SESSIONS } from "../../data/mockData";
import CustomerNav from "./CustomerNav";
import MainPage from "./MainPage";
import OrdersPage from "./OrdersPage";
import SearchPage from "./SearchPage";
import StorePage from "./StorePage";
import InquiryDetailPage from "./InquiryDetailPage";
import CustomerSupportListPage from "./CustomerSupportListPage";
import CustomerInquiryListPage from "./CustomerInquiryListPage";
import CustomerSettings from "./CustomerSettings";

const CustomerApp = ({ onLogout, user, onUpdateUser }) => {
  const [page, setPage] = useState("main");
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailBackPage, setDetailBackPage] = useState("main");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [storeTab, setStoreTab] = useState("chatbot");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [supportSessions, setSupportSessions] = useState(MOCK_SUPPORT_SESSIONS);
  const [supportMessagesBySessionId, setSupportMessagesBySessionId] = useState(MOCK_SUPPORT_MESSAGES_BY_SESSION_ID);
  const [inquiryPosts, setInquiryPosts] = useState(MOCK_INQUIRY_POSTS);
  const [inquiryRepliesByPostId, setInquiryRepliesByPostId] = useState(MOCK_INQUIRY_REPLIES_BY_POST_ID);
  const [isHomeLoading, setIsHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadCustomerHome = async () => {
      setIsHomeLoading(true);
      setHomeError("");
      try {
        const data = await getCustomerHome();
        if (ignore) return;
        setOrders(data.orders ?? []);
        setStores(data.stores ?? []);
      } catch (error) {
        if (ignore) return;
        setOrders([]);
        setStores([]);
        setHomeError(error.message || "고객 홈 데이터를 불러오지 못했습니다.");
      } finally {
        if (!ignore) {
          setIsHomeLoading(false);
        }
      }
    };

    loadCustomerHome();
    return () => {
      ignore = true;
    };
  }, []);

  const openStore = (store, tab = "chatbot", order = null) => {
    setSelectedStore(store);
    setStoreTab(tab);
    setSelectedOrder(order);
    setPage("store");
  };

  const openSupportSession = (sessionId, backPage = "supportList") => {
    setDetailBackPage(backPage);
    setSelectedDetail({ kind: "support", id: sessionId });
    setPage("inquiryDetail");
  };

  const openInquiryPost = (postId, backPage = "inquiryList") => {
    setDetailBackPage(backPage);
    setSelectedDetail({ kind: "inquiry", id: postId });
    setPage("inquiryDetail");
  };

  const createSupportSession = ({ title, store, order = selectedOrder, source = "manual", initialMessages = [] }) => {
    const now = new Date().toLocaleString();
    const nextId = Math.max(0, ...supportSessions.map(session => session.id)) + 1;
    const newSession = {
      id: nextId,
      storeId: store.id,
      storeName: store.name,
      status: "IN_PROGRESS",
      title,
      orderId: order?.id || null,
      createdAt: now,
      lastMessageAt: now,
      orderInfo: order ? `${order.productName} (${order.orderNumber})` : null,
      orderProductName: order?.productName || null,
      customerName: order?.customerName || user?.name || "고객",
      source,
    };
    setSupportSessions(prev => [newSession, ...prev]);
    setSupportMessagesBySessionId(prev => ({
      ...prev,
      [nextId]: initialMessages.map((message, index) => ({ ...message, id: index + 1, supportSessionId: nextId })),
    }));
    return newSession;
  };

  const createSupportFromChatbot = ({ title, store, messages }) => {
    const now = new Date().toLocaleString();
    const chatbotMessages = messages
      .filter(message => message.sender === "user")
      .map(message => ({ sender: "customer", content: message.content, time: now }));
    createSupportSession({
      title,
      store,
      order: selectedOrder,
      source: "chatbot",
      initialMessages: [
        { sender: "system", content: "챗봇에서 상담사 연결 요청이 접수되었습니다.", time: now },
        ...chatbotMessages,
      ],
    });
    setSelectedDetail(null);
    setPage("supportList");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNav onLogout={onLogout} setPage={setPage} setShowSearch={setShowSearch} showSearch={showSearch} page={page} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {page === "main" && <MainPage setPage={setPage} openStore={openStore} supportSessions={supportSessions} inquiryPosts={inquiryPosts} openSupportSession={(id) => openSupportSession(id, "main")} openInquiryPost={(id) => openInquiryPost(id, "main")} user={user} orders={orders} stores={stores} isHomeLoading={isHomeLoading} homeError={homeError} />}
        {page === "orders" && <OrdersPage setPage={setPage} openStore={openStore} setSelectedOrder={setSelectedOrder} orders={orders} stores={stores} />}
        {page === "search" && <SearchPage setPage={setPage} openStore={openStore} searchQuery={searchQuery} />}
        {page === "store" && <StorePage selectedStore={selectedStore} setPage={setPage} storeTab={storeTab} setStoreTab={setStoreTab} selectedOrder={selectedOrder} supportSessions={supportSessions} setSupportSessions={setSupportSessions} supportMessagesBySessionId={supportMessagesBySessionId} setSupportMessagesBySessionId={setSupportMessagesBySessionId} inquiryPosts={inquiryPosts} openSupportSession={(id) => openSupportSession(id, "store")} openInquiryPost={(id) => openInquiryPost(id, "store")} onCreateSupportFromChatbot={createSupportFromChatbot} createSupportSession={createSupportSession} />}
        {page === "supportList" && <CustomerSupportListPage setPage={setPage} supportSessions={supportSessions} openSupportSession={openSupportSession} />}
        {page === "inquiryList" && <CustomerInquiryListPage setPage={setPage} inquiryPosts={inquiryPosts} openInquiryPost={openInquiryPost} />}
        {page === "inquiryDetail" && <InquiryDetailPage selectedDetail={selectedDetail} detailBackPage={detailBackPage} supportSessions={supportSessions} setSupportSessions={setSupportSessions} supportMessagesBySessionId={supportMessagesBySessionId} setSupportMessagesBySessionId={setSupportMessagesBySessionId} inquiryPosts={inquiryPosts} inquiryRepliesByPostId={inquiryRepliesByPostId} setInquiryRepliesByPostId={setInquiryRepliesByPostId} setPage={setPage} />}
        {page === "settings" && <CustomerSettings setPage={setPage} user={user} onUpdateUser={onUpdateUser} />}
      </div>
    </div>
  );
};

export default CustomerApp;
