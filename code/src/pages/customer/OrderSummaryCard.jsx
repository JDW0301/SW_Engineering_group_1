import { Package } from "lucide-react";
import { Card } from "../../components/ui";

const OrderSummaryCard = ({ order, onClick }) => (
  <Card className="p-4" onClick={onClick}>
    <div className="flex items-start justify-between gap-3 mb-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <Package size={18} className="text-indigo-500" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 font-mono">{order.orderNumber}</p>
          <p className="text-sm font-medium text-gray-900 truncate">{order.productName} <span className="text-gray-400">x{order.quantity}</span></p>
        </div>
      </div>
      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{order.totalPrice.toLocaleString()}원</span>
    </div>
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
      <span>{order.orderedAt}</span>
      <span>{order.storeName}</span>
    </div>
  </Card>
);

export default OrderSummaryCard;
