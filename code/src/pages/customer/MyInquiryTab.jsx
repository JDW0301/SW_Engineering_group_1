import { useState } from "react";
import { Card, StatusBadge, Button } from "../../components/ui";

const MyInquiryTab = ({ supportSessions, inquiryPosts, onOpenSupportSession, onOpenInquiryPost }) => {
  const [mode, setMode] = useState("consult");
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button variant={mode === "consult" ? "primary" : "outline"} size="sm" onClick={() => setMode("consult")}>상담</Button>
        <Button variant={mode === "board" ? "primary" : "outline"} size="sm" onClick={() => setMode("board")}>문의</Button>
      </div>
      {mode === "consult" ? (
        <div className="space-y-2">
          {supportSessions.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">상담 기록이 없습니다</p> :
            supportSessions.map(session => (
              <Card key={session.id} className="p-3" onClick={() => onOpenSupportSession(session.id)}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{session.title}</p>
                    <p className="text-xs text-gray-500">{session.createdAt}</p>
                  </div>
                  <StatusBadge status={session.status} />
                </div>
              </Card>
            ))
          }
        </div>
      ) : (
        <div className="space-y-2">
          {inquiryPosts.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">문의 기록이 없습니다</p> :
            inquiryPosts.map(post => (
              <Card key={post.id} className="p-3" onClick={() => onOpenInquiryPost(post.id)}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{post.title}</p>
                    <p className="text-xs text-gray-500">{post.createdAt}</p>
                  </div>
                  <StatusBadge status={post.status} />
                </div>
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
};

export default MyInquiryTab;
