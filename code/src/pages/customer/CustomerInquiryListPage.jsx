import { ArrowLeft, FileText } from "lucide-react";
import { Card, StatusBadge } from "../../components/ui";

const CustomerInquiryListPage = ({ setPage, inquiryPosts, openInquiryPost }) => {
  const sorted = [...inquiryPosts].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setPage("main")} className="p-1"><ArrowLeft size={20} /></button>
        <h2 className="text-lg font-bold">문의 목록</h2>
      </div>
      <div className="space-y-2">
        {sorted.length === 0 ? <p className="text-sm text-gray-400 py-4 text-center">문의 기록이 없습니다</p> : sorted.map(post => (
          <Card key={post.id} className="p-3" onClick={() => openInquiryPost(post.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">{post.title}</p>
                  <p className="text-xs text-gray-500">{post.storeName} · {post.lastMessageAt}</p>
                </div>
              </div>
              <StatusBadge status={post.status} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerInquiryListPage;
