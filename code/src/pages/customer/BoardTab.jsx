import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Lock, Image, Package, Edit3, X } from "lucide-react";
import { Card, StatusBadge, Input, Button } from "../../components/ui";
import { createInquiry, deleteInquiry, listStoreInquiries, updateInquiry } from "../../api/inquiries";

const BoardTab = ({ store, posts: initialPosts, orders, onInquiryCreated, onInquiryUpdated, onInquiryDeleted }) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [writing, setWriting] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", isSecret: false, orderId: null, image: null });
  const [localPosts, setLocalPosts] = useState(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const imageInputRef = useRef(null);
  const storeOrders = orders.filter(o => o.storeId === store.id);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    listStoreInquiries(store.id)
      .then(posts => {
        if (!ignore) setLocalPosts(posts);
      })
      .catch(error => {
        if (!ignore) setError(error.message);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [store.id]);

  const submitPost = async () => {
    if (!newPost.content.trim()) return;
    setError("");
    try {
      const payload = {
        storeId: store.id,
        title: newPost.title,
        content: newPost.content,
        orderId: newPost.orderId,
        isSecret: newPost.isSecret,
        image: newPost.image?.url || null,
      };
      if (editingPostId) {
        const post = await updateInquiry(editingPostId, payload);
        setLocalPosts(prev => prev.map(item => item.id === post.id ? post : item));
        onInquiryUpdated(post);
      } else {
        const post = await createInquiry(payload);
        setLocalPosts(p => [post, ...p]);
        onInquiryCreated(post);
      }
      setNewPost({ title: "", content: "", isSecret: false, orderId: null, image: null });
      setEditingPostId(null);
      setWriting(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const closeEditor = () => {
    setWriting(false);
    setEditingPostId(null);
    setNewPost({ title: "", content: "", isSecret: false, orderId: null, image: null });
    setError("");
  };

  const startWriting = () => {
    setEditingPostId(null);
    setNewPost({ title: "", content: "", isSecret: false, orderId: null, image: null });
    setError("");
    setWriting(true);
  };

  const handleDelete = async (post) => {
    if (!window.confirm("문의를 삭제하시겠습니까?")) return;
    setError("");
    try {
      await deleteInquiry(post.id);
      setLocalPosts(prev => prev.filter(p => p.id !== post.id));
      setSelectedPost(null);
      onInquiryDeleted?.(post.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const startEditing = (post) => {
    setNewPost({ title: post.title, content: post.content, isSecret: post.isSecret, orderId: post.orderId || null, image: post.image ? { name: "첨부 이미지", url: post.image } : null });
    setEditingPostId(post.id);
    setSelectedPost(null);
    setError("");
    setWriting(true);
  };

  const attachImage = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 첨부할 수 있습니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewPost(prev => ({ ...prev, image: { name: file.name, url: String(reader.result || "") } }));
      setError("");
    };
    reader.onerror = () => setError("이미지를 읽지 못했습니다.");
    reader.readAsDataURL(file);
  };

  if (writing) return (
    <div>
      <button onClick={closeEditor} className="flex items-center gap-1 text-sm text-gray-500 mb-3"><ArrowLeft size={16} /> 목록</button>
      <h3 className="font-bold mb-4">{editingPostId ? "문의 수정" : "문의 작성"}</h3>
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
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={attachImage} />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition" onClick={() => !newPost.image && imageInputRef.current?.click()}>
            {newPost.image ? (
              <div className="space-y-2">
                <img src={newPost.image.url} alt="첨부 이미지 미리보기" className="mx-auto max-h-40 rounded-lg object-contain" />
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-gray-600">{newPost.image.name}</span>
                  <button type="button" onClick={() => setNewPost(p => ({ ...p, image: null }))} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                </div>
              </div>
            ) : (
              <div>
                <Image size={20} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-400">클릭하여 이미지 첨부</p>
              </div>
            )}
          </div>
          {newPost.image && <p className="text-xs text-green-600">미리보기: 이미지가 첨부되었습니다</p>}
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newPost.isSecret} onChange={e => setNewPost(p => ({ ...p, isSecret: e.target.checked }))} /> <Lock size={14} /> 비밀글</label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button className="w-full" onClick={submitPost}>{editingPostId ? "글 수정" : "글 작성"}</Button>
      </div>
    </div>
  );

  if (selectedPost) return (
    <div>
      <button onClick={() => setSelectedPost(null)} className="flex items-center gap-1 text-sm text-gray-500 mb-3"><ArrowLeft size={16} /> 목록</button>
      <Card className="p-4">
        <h3 className="font-bold mb-1">{selectedPost.title}</h3>
        <p className="text-xs text-gray-500 mb-2">{selectedPost.createdAt} · {selectedPost.customerName || "고객"}</p>
        {selectedPost.orderInfo && (
          <div className="flex items-center gap-1.5 mb-2 bg-gray-50 rounded px-2 py-1.5">
            <Package size={13} className="text-gray-400" />
            <span className="text-xs text-gray-600">참조 주문: {selectedPost.orderInfo}</span>
          </div>
        )}
        <p className="text-sm text-gray-700 mb-3">{selectedPost.content}</p>
        {selectedPost.image && (
          <div className="mb-3 rounded-lg bg-gray-100 p-3 text-center">
            <img src={selectedPost.image} alt="첨부 이미지" className="mx-auto max-h-64 rounded-lg object-contain" />
          </div>
        )}
        {(selectedPost.replies || []).length > 0 && (
          <div className="bg-indigo-50 rounded-lg p-3 mb-3">
            <p className="text-xs font-medium text-indigo-700 mb-1">답변</p>
            <p className="text-sm text-indigo-800">{selectedPost.replies[0].content}</p>
          </div>
        )}
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        <div className="flex gap-2">
          {(selectedPost.replies || []).length === 0 && <Button size="sm" variant="outline" onClick={() => startEditing(selectedPost)}><Edit3 size={14} /> 수정</Button>}
          <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleDelete(selectedPost)}>삭제</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedPost(null)}>목록</Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">문의 게시판</h3>
        <Button size="sm" onClick={startWriting}><Edit3 size={14} /> 문의 작성</Button>
      </div>
      <div className="space-y-2">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {isLoading && <p className="text-sm text-gray-400 text-center py-4">문의 목록을 불러오는 중입니다.</p>}
        {localPosts.map((p, index) => {
          const canOpenPost = !p.isSecret || p.isMine;
          return (
          <Card key={p.id} className="p-3" onClick={canOpenPost ? () => setSelectedPost(p) : undefined}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">#{localPosts.length - index}</span>
                {p.isSecret && <Lock size={12} className="text-gray-400" />}
                <span className="text-sm">{canOpenPost ? p.title : "비밀글 입니다."}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} />
                <span className="text-xs text-gray-400">{p.customerName || "고객"}</span>
              </div>
            </div>
          </Card>
        );
        })}
      </div>
    </div>
  );
};

export default BoardTab;
