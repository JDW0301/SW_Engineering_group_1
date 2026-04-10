import { useState } from "react";
import { MOCK_INQUIRIES, MOCK_BOARD_POSTS } from "../../data/mockData";
import CustomerNav from "./CustomerNav";
import MainPage from "./MainPage";
import OrdersPage from "./OrdersPage";
import SearchPage from "./SearchPage";
import StorePage from "./StorePage";
import InquiryDetailPage from "./InquiryDetailPage";
import CustomerSettings from "./CustomerSettings";

const CustomerApp = ({ onLogout }) => {
  const [page, setPage] = useState("main");
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [storeTab, setStoreTab] = useState("chatbot");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [inquiries, setInquiries] = useState(MOCK_INQUIRIES);
  const [chatbotHistory, setChatbotHistory] = useState([]);

  const openStore = (store, tab = "chatbot", order = null) => {
    setSelectedStore(store);
    setStoreTab(tab);
    if (order) setSelectedOrder(order);
    setPage("store");
  };
  const openInquiry = (inq) => { setSelectedInquiry(inq); setPage("inquiryDetail"); };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNav onLogout={onLogout} setPage={setPage} setShowSearch={setShowSearch} showSearch={showSearch} page={page} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {page === "main" && <MainPage setPage={setPage} openStore={openStore} inquiries={inquiries} openInquiry={openInquiry} />}
        {page === "orders" && <OrdersPage setPage={setPage} openStore={openStore} setSelectedOrder={setSelectedOrder} />}
        {page === "search" && <SearchPage setPage={setPage} openStore={openStore} searchQuery={searchQuery} />}
        {page === "store" && <StorePage selectedStore={selectedStore} setPage={setPage} storeTab={storeTab} setStoreTab={setStoreTab} selectedOrder={selectedOrder} inquiries={inquiries} setInquiries={setInquiries} openInquiry={openInquiry} chatbotHistory={chatbotHistory} setChatbotHistory={setChatbotHistory} />}
        {page === "inquiryDetail" && <InquiryDetailPage selectedInquiry={selectedInquiry} setSelectedInquiry={setSelectedInquiry} inquiries={inquiries} setInquiries={setInquiries} setPage={setPage} selectedStore={selectedStore} />}
        {page === "settings" && <CustomerSettings setPage={setPage} />}
      </div>
    </div>
  );
};

export default CustomerApp;
