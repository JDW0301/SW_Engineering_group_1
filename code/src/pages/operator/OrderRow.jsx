import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Card, StatusBadge } from "../../components/ui";

const OrderRow = ({ order, supportSessions, inquiryPosts, onOpenSupportSession, onOpenInquiryPost }) => {
  const [expanded, setExpanded] = useState(false);
  const activeSupportSessions = supportSessions.filter(session => session.orderId === order.id && session.status !== "RESOLVED");
  const linkedInquiryPosts = inquiryPosts.filter(post => post.orderId === order.id);
  return (
    <Card className="p-3 mb-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{order.productName}</p>
          <p className="text-xs text-gray-500">{order.orderNumber} · {order.orderedAt} · x{order.quantity}</p>
          <p className="text-xs text-gray-500">{order.customerName} · {order.phone}</p>
          <p className="text-xs font-semibold text-gray-700">{order.totalPrice.toLocaleString()}원</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
      </div>
      {expanded && (
        <div className="mt-2 pt-2 border-t space-y-2">
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">상담</p>
            {activeSupportSessions.length === 0 ? <p className="text-xs text-gray-400 px-2 py-1">진행 중인 상담 없음</p> : activeSupportSessions.map(session => (
              <div key={session.id} onClick={() => onOpenSupportSession(session.id)} className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                <span className="text-xs">{session.title}</span>
                <StatusBadge status={session.status} />
              </div>
            ))}
          </div>
          <div className="border-t pt-2">
            <p className="text-xs font-semibold text-gray-700 mb-1">문의</p>
            {linkedInquiryPosts.length === 0 ? <p className="text-xs text-gray-400 px-2 py-1">연결된 문의 없음</p> : linkedInquiryPosts.map(post => (
              <div key={post.id} onClick={() => onOpenInquiryPost(post.id)} className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                <span className="text-xs">{post.createdAt.slice(0, 10)} · {post.title}</span>
                <StatusBadge status={post.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default OrderRow;
