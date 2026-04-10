import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Card, StatusBadge } from "../../components/ui";

const OrderRow = ({ order, inquiries, onOpenInquiry }) => {
  const [expanded, setExpanded] = useState(false);
  const linked = inquiries.filter(i => i.orderId === order.id);
  return (
    <Card className="p-3 mb-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{order.productName}</p>
          <p className="text-xs text-gray-500">{order.orderNumber} · {order.orderedAt}</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
      </div>
      {expanded && linked.length > 0 && (
        <div className="mt-2 pt-2 border-t space-y-1">
          {linked.map(inq => (
            <div key={inq.id} onClick={() => onOpenInquiry(inq)} className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
              <span className="text-xs">{inq.title}</span>
              <StatusBadge status={inq.status} />
            </div>
          ))}
        </div>
      )}
      {expanded && linked.length === 0 && <p className="text-xs text-gray-400 mt-2 pt-2 border-t">연결된 상담/문의 없음</p>}
    </Card>
  );
};

export default OrderRow;
