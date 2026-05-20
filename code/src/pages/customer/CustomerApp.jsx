import { useEffect, useState } from "react";
import { isAuthExpiredError } from "../../api/auth";
import { getCustomerHome } from "../../api/customerHome";
import { listMyInquiries } from "../../api/inquiries";
import { createSupportSession as createSupportSessionApi } from "../../api/support";
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
  const [searchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [supportSessions, setSupportSessions] = useState([]);
  const [supportMessagesBySessionId, setSupportMessagesBySessionId] = useState({});
  const [inquiryPosts, setInquiryPosts] = useState([]);
  const [inquiryRepliesByPostId, setInquiryRepliesByPostId] = useState({});
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
        setSupportSessions(data.supportSessions ?? []);
        setSupportMessagesBySessionId(data.supportMessagesBySessionId ?? {});
        const posts = await listMyInquiries();
        setInquiryPosts(posts);
        setInquiryRepliesByPostId(Object.fromEntries(posts.map(post => [post.id, post.replies || []])));
      } catch (error) {
        if (ignore) return;
        if (isAuthExpiredError(error)) return;
        setOrders([]);
        setStores([]);
        setSupportSessions([]);
        setSupportMessagesBySessionId({});
        setInquiryPosts([]);
        setInquiryRepliesByPostId({});
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
    setSelectedOrder(order ?? null);
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

  const createSupportSession = async ({ title, store, order = selectedOrder, source = "manual", initialMessages = [] }) => {
    const session = await createSupportSessionApi({
      storeId: store.id,
      orderId: order?.id || null,
      initialMessages: initialMessages.length > 0 ? initialMessages : [{ sender: "system", content: title }],
      source,
    });
    setSupportSessions(prev => [session, ...prev.filter(item => item.id !== session.id)]);
    setSupportMessagesBySessionId(prev => ({ ...prev, [session.id]: session.messages || [] }));
    return session;
  };

  const createSupportFromChatbot = async ({ title, store, messages, order = selectedOrder }) => {
    const now = new Date().toLocaleString();
    const chatbotMessages = messages
      .filter(message => message.sender === "user")
      .map(message => ({ sender: "customer", content: message.content, time: now }));
    await createSupportSession({
      title,
      store,
      order,
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
        {page === "search" && <SearchPage setPage={setPage} openStore={openStore} searchQuery={searchQuery} stores={stores} />}
        {page === "store" && <StorePage selectedStore={selectedStore} setPage={setPage} storeTab={storeTab} setStoreTab={setStoreTab} selectedOrder={selectedOrder} onSelectOrder={setSelectedOrder} orders={orders} supportSessions={supportSessions} setSupportSessions={setSupportSessions} supportMessagesBySessionId={supportMessagesBySessionId} setSupportMessagesBySessionId={setSupportMessagesBySessionId} inquiryPosts={inquiryPosts} setInquiryPosts={setInquiryPosts} openSupportSession={(id) => openSupportSession(id, "store")} openInquiryPost={(id) => openInquiryPost(id, "store")} onCreateSupportFromChatbot={createSupportFromChatbot} createSupportSession={createSupportSession} />}
        {page === "supportList" && <CustomerSupportListPage setPage={setPage} supportSessions={supportSessions} openSupportSession={openSupportSession} />}
        {page === "inquiryList" && <CustomerInquiryListPage setPage={setPage} inquiryPosts={inquiryPosts} openInquiryPost={openInquiryPost} />}
        {page === "inquiryDetail" && <InquiryDetailPage selectedDetail={selectedDetail} detailBackPage={detailBackPage} supportSessions={supportSessions} setSupportSessions={setSupportSessions} supportMessagesBySessionId={supportMessagesBySessionId} setSupportMessagesBySessionId={setSupportMessagesBySessionId} inquiryPosts={inquiryPosts} inquiryRepliesByPostId={inquiryRepliesByPostId} setInquiryRepliesByPostId={setInquiryRepliesByPostId} setPage={setPage} />}
        {page === "settings" && <CustomerSettings setPage={setPage} user={user} onUpdateUser={onUpdateUser} />}
      </div>
    </div>
  );
};

export default CustomerApp;
