import { useState } from "react";
import { MOCK_INQUIRIES } from "../../data/mockData";
import OperatorNav from "./OperatorNav";
import OperatorMain from "./OperatorMain";
import ChannelPage from "./ChannelPage";
import OperatorInquiryDetail from "./OperatorInquiryDetail";
import StatsPage from "./StatsPage";
import OperatorSettings from "./OperatorSettings";

const OperatorApp = ({ onLogout, user }) => {
  const [page, setPage] = useState("main");
  const [inquiries, setInquiries] = useState(MOCK_INQUIRIES);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [sideNav, setSideNav] = useState(false);
  const [prevPage, setPrevPage] = useState("main");
  const storeName = user?.storeName || "패션스토어 루미";

  const openInquiry = (inq) => { setPrevPage(page); setSelectedInquiry(inq); setPage("inquiryDetail"); };

  return (
    <div className="min-h-screen bg-gray-50">
      <OperatorNav page={page} setPage={setPage} onLogout={onLogout} sideNav={sideNav} setSideNav={setSideNav} storeName={storeName} />
      <div className="max-w-5xl mx-auto px-4 py-6">
        {page === "main" && <OperatorMain inquiries={inquiries} openInquiry={openInquiry} />}
        {page === "channel" && <ChannelPage inquiries={inquiries} openInquiry={openInquiry} />}
        {page === "inquiryDetail" && <OperatorInquiryDetail selectedInquiry={selectedInquiry} setSelectedInquiry={setSelectedInquiry} inquiries={inquiries} setInquiries={setInquiries} setPage={setPage} prevPage={prevPage} />}
        {page === "stats" && <StatsPage inquiries={inquiries} />}
        {page === "settings" && <OperatorSettings user={user} />}
      </div>
    </div>
  );
};

export default OperatorApp;
