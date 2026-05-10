import { useState } from "react";
import { MOCK_INQUIRY_POSTS, MOCK_INQUIRY_REPLIES_BY_POST_ID, MOCK_SUPPORT_MESSAGES_BY_SESSION_ID, MOCK_SUPPORT_SESSIONS } from "../../data/mockData";
import OperatorNav from "./OperatorNav";
import OperatorMain from "./OperatorMain";
import ChannelPage from "./ChannelPage";
import OperatorInquiryDetail from "./OperatorInquiryDetail";
import StatsPage from "./StatsPage";
import OperatorSettings from "./OperatorSettings";

const OperatorApp = ({ onLogout, user, onUpdateUser }) => {
  const [page, setPage] = useState("main");
  const [supportSessions, setSupportSessions] = useState(MOCK_SUPPORT_SESSIONS);
  const [supportMessagesBySessionId, setSupportMessagesBySessionId] = useState(MOCK_SUPPORT_MESSAGES_BY_SESSION_ID);
  const [inquiryPosts, setInquiryPosts] = useState(MOCK_INQUIRY_POSTS);
  const [inquiryRepliesByPostId, setInquiryRepliesByPostId] = useState(MOCK_INQUIRY_REPLIES_BY_POST_ID);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [sideNav, setSideNav] = useState(false);
  const [prevPage, setPrevPage] = useState("main");
  const storeName = user?.storeName || user?.store?.name || "패션스토어 루미";

  const openSupportSession = (sessionId) => {
    setPrevPage(page);
    setSelectedDetail({ kind: "support", id: sessionId });
    setPage("inquiryDetail");
  };

  const openInquiryPost = (postId) => {
    setPrevPage(page);
    setSelectedDetail({ kind: "inquiry", id: postId });
    setPage("inquiryDetail");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <OperatorNav page={page} setPage={setPage} onLogout={onLogout} sideNav={sideNav} setSideNav={setSideNav} storeName={storeName} />
      <div className="max-w-5xl mx-auto px-4 py-6">
        {page === "main" && <OperatorMain supportSessions={supportSessions} supportMessagesBySessionId={supportMessagesBySessionId} inquiryPosts={inquiryPosts} inquiryRepliesByPostId={inquiryRepliesByPostId} openSupportSession={openSupportSession} openInquiryPost={openInquiryPost} />}
        {page === "channel" && <ChannelPage supportSessions={supportSessions} supportMessagesBySessionId={supportMessagesBySessionId} inquiryPosts={inquiryPosts} inquiryRepliesByPostId={inquiryRepliesByPostId} openSupportSession={openSupportSession} openInquiryPost={openInquiryPost} />}
        {page === "inquiryDetail" && <OperatorInquiryDetail selectedDetail={selectedDetail} supportSessions={supportSessions} setSupportSessions={setSupportSessions} supportMessagesBySessionId={supportMessagesBySessionId} setSupportMessagesBySessionId={setSupportMessagesBySessionId} inquiryPosts={inquiryPosts} setInquiryPosts={setInquiryPosts} inquiryRepliesByPostId={inquiryRepliesByPostId} setInquiryRepliesByPostId={setInquiryRepliesByPostId} setPage={setPage} prevPage={prevPage} />}
        {page === "stats" && <StatsPage supportSessions={supportSessions} supportMessagesBySessionId={supportMessagesBySessionId} inquiryPosts={inquiryPosts} inquiryRepliesByPostId={inquiryRepliesByPostId} />}
        {page === "settings" && <OperatorSettings user={user} onUpdateUser={onUpdateUser} />}
      </div>
    </div>
  );
};

export default OperatorApp;
