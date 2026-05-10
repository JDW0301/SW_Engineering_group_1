import { ArrowLeft, MessageCircle } from "lucide-react";
import { Card, StatusBadge } from "../../components/ui";

const CustomerSupportListPage = ({ setPage, supportSessions, openSupportSession }) => {
  const sorted = [...supportSessions].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setPage("main")} className="p-1"><ArrowLeft size={20} /></button>
        <h2 className="text-lg font-bold">상담 목록</h2>
      </div>
      <div className="space-y-2">
        {sorted.length === 0 ? <p className="text-sm text-gray-400 py-4 text-center">상담 기록이 없습니다</p> : sorted.map(session => (
          <Card key={session.id} className="p-3" onClick={() => openSupportSession(session.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle size={18} className="text-indigo-500" />
                <div>
                  <p className="text-sm font-medium">{session.title}</p>
                  <p className="text-xs text-gray-500">{session.storeName} · {session.lastMessageAt}</p>
                </div>
              </div>
              <StatusBadge status={session.status} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerSupportListPage;
