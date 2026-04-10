import { useState } from "react";
import { Card, StatusBadge, Button } from "../../components/ui";

const MyInquiryTab = ({ inquiries, onOpenInquiry }) => {
  const [mode, setMode] = useState("consult");
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button variant={mode === "consult" ? "primary" : "outline"} size="sm" onClick={() => setMode("consult")}>상담</Button>
        <Button variant={mode === "board" ? "primary" : "outline"} size="sm" onClick={() => setMode("board")}>문의</Button>
      </div>
      {mode === "consult" ? (
        <div className="space-y-2">
          {inquiries.filter(i => i.type === "상담").length === 0 ? <p className="text-sm text-gray-400 text-center py-4">상담 기록이 없습니다</p> :
            inquiries.filter(i => i.type === "상담").map(inq => (
              <Card key={inq.id} className="p-3" onClick={() => onOpenInquiry(inq)}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{inq.title}</p>
                    <p className="text-xs text-gray-500">{inq.createdAt}</p>
                  </div>
                  <StatusBadge status={inq.status} />
                </div>
              </Card>
            ))
          }
        </div>
      ) : (
        <div className="space-y-2">
          {inquiries.filter(i => i.type === "문의").length === 0 ? <p className="text-sm text-gray-400 text-center py-4">문의 기록이 없습니다</p> :
            inquiries.filter(i => i.type === "문의").map(inq => (
              <Card key={inq.id} className="p-3" onClick={() => onOpenInquiry(inq)}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{inq.title}</p>
                    <p className="text-xs text-gray-500">{inq.createdAt}</p>
                  </div>
                  <StatusBadge status={inq.status} />
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
