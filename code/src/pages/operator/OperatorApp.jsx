import { useEffect, useState } from "react";
import { isAuthExpiredError } from "../../api/auth";
import { listOperatorInquiries } from "../../api/inquiries";
import { getOperatorWorkspace, getOperatorSettings } from "../../api/operatorWorkspace";
import OperatorNav from "./OperatorNav";
import OperatorMain from "./OperatorMain";
import ChannelPage from "./ChannelPage";
import OperatorInquiryDetail from "./OperatorInquiryDetail";
import StatsPage from "./StatsPage";
import OperatorSettings from "./OperatorSettings";

const OperatorApp = ({ onLogout, user, onUpdateUser }) => {
  const [page, setPage] = useState("main");
  const [supportSessions, setSupportSessions] = useState([]);
  const [supportMessagesBySessionId, setSupportMessagesBySessionId] = useState({});
  const [inquiryPosts, setInquiryPosts] = useState([]);
  const [inquiryRepliesByPostId, setInquiryRepliesByPostId] = useState({});
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notesByTarget, setNotesByTarget] = useState({});
  const [presets, setPresets] = useState([]);
  const [sideNav, setSideNav] = useState(false);
  const [prevPage, setPrevPage] = useState("main");
  const storeName = user?.storeName || user?.store?.name || "패션스토어 루미";

  useEffect(() => {
    let ignore = false;
    Promise.all([getOperatorWorkspace(), listOperatorInquiries(), getOperatorSettings()])
      .then(([workspace, posts, settings]) => {
        if (ignore) return;
        setOrders(workspace.orders ?? []);
        setSupportSessions(workspace.supportSessions ?? []);
        setSupportMessagesBySessionId(workspace.supportMessagesBySessionId ?? {});
        setNotesByTarget(workspace.notesByTarget ?? {});
        setInquiryPosts(posts);
        setInquiryRepliesByPostId(Object.fromEntries(posts.map(post => [post.id, post.replies || []])));
        setPresets(settings.presets ?? []);
      })
      .catch(error => {
        if (isAuthExpiredError(error)) return;
      });
    return () => {
      ignore = true;
    };
  }, []);

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
        {page === "main" && <OperatorMain orders={orders} supportSessions={supportSessions} supportMessagesBySessionId={supportMessagesBySessionId} inquiryPosts={inquiryPosts} inquiryRepliesByPostId={inquiryRepliesByPostId} openSupportSession={openSupportSession} openInquiryPost={openInquiryPost} />}
        {page === "channel" && <ChannelPage orders={orders} supportSessions={supportSessions} supportMessagesBySessionId={supportMessagesBySessionId} inquiryPosts={inquiryPosts} inquiryRepliesByPostId={inquiryRepliesByPostId} openSupportSession={openSupportSession} openInquiryPost={openInquiryPost} />}
        {page === "inquiryDetail" && <OperatorInquiryDetail selectedDetail={selectedDetail} supportSessions={supportSessions} setSupportSessions={setSupportSessions} supportMessagesBySessionId={supportMessagesBySessionId} setSupportMessagesBySessionId={setSupportMessagesBySessionId} inquiryPosts={inquiryPosts} setInquiryPosts={setInquiryPosts} inquiryRepliesByPostId={inquiryRepliesByPostId} setInquiryRepliesByPostId={setInquiryRepliesByPostId} setPage={setPage} prevPage={prevPage} orders={orders} notesByTarget={notesByTarget} setNotesByTarget={setNotesByTarget} presets={presets} />}
        {page === "stats" && <StatsPage supportSessions={supportSessions} supportMessagesBySessionId={supportMessagesBySessionId} inquiryPosts={inquiryPosts} inquiryRepliesByPostId={inquiryRepliesByPostId} />}
        {page === "settings" && <OperatorSettings user={user} onUpdateUser={onUpdateUser} onPresetsChange={setPresets} />}
      </div>
    </div>
  );
};

export default OperatorApp;
