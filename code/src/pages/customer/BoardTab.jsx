import { useState } from "react";
import { ArrowLeft, Lock, Image, Package, Edit3, X } from "lucide-react";
import { Card, StatusBadge, Input, Button } from "../../components/ui";
import { MOCK_ORDERS } from "../../data/mockData";

const BoardTab = ({ store, posts: initialPosts }) => {
  const [view, setView] = useState("list");
  const [selectedPost, setSelectedPost] = useState(null);
  const [writing, setWriting] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", isSecret: false, orderId: null, image: null });
  const [localPosts, setLocalPosts] = useState(initialPosts);
  const storeOrders = MOCK_ORDERS.filter(o => o.storeId === store.id);

  const submitPost = () => {
    if (!newPost.content.trim()) return;
    const linkedOrder = storeOrders.find(o => o.id === newPost.orderId);
    const post = {
      id: localPosts.length + 100,
      storeId: store.id,
      title: newPost.title || newPost.content.slice(0, 20) + "...",
      author: "서**",
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      status: "대기",
      isSecret: newPost.isSecret,
      content: newPost.content,
      orderId: newPost.orderId,
      orderInfo: linkedOrder ? `${linkedOrder.productName} (${linkedOrder.orderNumber})` : null,
      image: newPost.image,
      answer: "",
    };
    setLocalPosts(p => [post, ...p]);
    setNewPost({ title: "", content: "", isSecret: false, orderId: null, image: null });
    setWriting(false);
  };

  if (writing) return (
    <div>
      <button onClick={() => setWriting(false)} className="flex items-center gap-1 text-sm text-gray-500 mb-3"><ArrowLeft size={16} /> 목록</button>
      <h3 className="font-bold mb-4">문의 작성</h3>
      <div className="space-y-3">
        <Input label="제목" value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} placeholder="제목 (선택, 미입력 시 본문 내용으로)" />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">본문</label>
          <textarea className="border rounded-lg px-3 py-2 text-sm h-32 resize-none" value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} placeholder="문의 내용을 작성하세요" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">주문 내용 참조</label>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={newPost.orderId || ""} onChange={e => setNewPost(p => ({ ...p, orderId: e.target.value ? parseInt(e.target.value) : null }))}>
            <option value="">선택 안 함</option>
            {storeOrders.map(o => <option key={o.id} value={o.id}>{o.productName} ({o.orderNumber})</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">이미지 첨부</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition">
            {newPost.image ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{newPost.image}</span>
                <button onClick={() => setNewPost(p => ({ ...p, image: null }))} className="text-red-400 hover:text-red-600"><X size={16} /></button>
              </div>
            ) : (
              <div onClick={() => setNewPost(p => ({ ...p, image: "screenshot_" + Date.now() + ".png" }))}>
                <Image size={20} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-400">클릭하여 이미지 첨부</p>
              </div>
            )}
          </div>
          {newPost.image && <p className="text-xs text-green-600">미리보기: 이미지가 첨부되었습니다</p>}
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newPost.isSecret} onChange={e => setNewPost(p => ({ ...p, isSecret: e.target.checked }))} /> <Lock size={14} /> 비밀글</label>
        <Button className="w-full" onClick={submitPost}>글 작성</Button>
      </div>
    </div>
  );

  if (selectedPost) return (
    <div>
      <button onClick={() => setSelectedPost(null)} className="flex items-center gap-1 text-sm text-gray-500 mb-3"><ArrowLeft size={16} /> 목록</button>
      <Card className="p-4">
        <h3 className="font-bold mb-1">{selectedPost.title}</h3>
        <p className="text-xs text-gray-500 mb-2">{selectedPost.date} {selectedPost.time || ""} · {selectedPost.author}</p>
        {selectedPost.orderInfo && (
          <div className="flex items-center gap-1.5 mb-2 bg-gray-50 rounded px-2 py-1.5">
            <Package size={13} className="text-gray-400" />
            <span className="text-xs text-gray-600">참조 주문: {selectedPost.orderInfo}</span>
          </div>
        )}
        <p className="text-sm text-gray-700 mb-3">{selectedPost.content}</p>
        {selectedPost.image && (
          <div className="mb-3 bg-gray-100 rounded-lg p-3 text-center">
            <Image size={24} className="mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">첨부 이미지: {selectedPost.image}</p>
          </div>
        )}
        {selectedPost.answer && (
          <div className="bg-indigo-50 rounded-lg p-3 mb-3">
            <p className="text-xs font-medium text-indigo-700 mb-1">답변</p>
            <p className="text-sm text-indigo-800">{selectedPost.answer}</p>
          </div>
        )}
        <div className="flex gap-2">
          {!selectedPost.answer && <Button size="sm" variant="outline" onClick={() => { setNewPost({ title: selectedPost.title, content: selectedPost.content, isSecret: selectedPost.isSecret, orderId: selectedPost.orderId || null, image: selectedPost.image }); setSelectedPost(null); setWriting(true); }}><Edit3 size={14} /> 수정</Button>}
          <Button size="sm" variant="ghost" onClick={() => setSelectedPost(null)}>목록</Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">문의 게시판</h3>
        <Button size="sm" onClick={() => setWriting(true)}><Edit3 size={14} /> 문의 작성</Button>
      </div>
      <div className="space-y-2">
        {localPosts.map(p => (
          <Card key={p.id} className="p-3" onClick={() => !p.isSecret && setSelectedPost(p)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">#{p.id}</span>
                {p.isSecret && <Lock size={12} className="text-gray-400" />}
                <span className="text-sm">{p.isSecret ? "비밀글 입니다." : p.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} />
                <span className="text-xs text-gray-400">{p.author}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BoardTab;
