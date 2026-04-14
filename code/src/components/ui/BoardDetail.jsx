import { ArrowLeft, Package, Image } from "lucide-react";
import { Card, Button } from "./index";
import { MOCK_ORDERS } from "../../data/mockData";

const BoardDetail = ({ inquiry, onBack, isOperator, onAnswerSubmit }) => {
  const order = MOCK_ORDERS.find(o => o.id === inquiry.orderId);
  const orderInfo = order ? `${order.productName} (${order.orderNumber})` : null;
  
  const customerMessage = inquiry.messages.find(m => m.sender === "customer");
  const operatorMessage = inquiry.messages.find(m => m.sender === "operator");

  return (
    <div>
      {!isOperator && (
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <ArrowLeft size={16} /> 목록
        </button>
      )}
      <Card className="p-4">
        {!isOperator && <h3 className="font-bold mb-1">{inquiry.title}</h3>}
        <p className="text-xs text-gray-500 mb-2">
          {inquiry.createdAt} · {order ? order.customerName : "고객"}
        </p>
        {orderInfo && (
          <div className="flex items-center gap-1.5 mb-2 bg-gray-50 rounded px-2 py-1.5">
            <Package size={13} className="text-gray-400" />
            <span className="text-xs text-gray-600">주문 상품: {orderInfo}</span>
          </div>
        )}
        <p className="text-sm text-gray-700 mb-3">{customerMessage?.content}</p>
        
        {operatorMessage ? (
          <div className="bg-indigo-50 rounded-lg p-3 mb-3">
            <p className="text-xs font-medium text-indigo-700 mb-1">답변</p>
            <p className="text-sm text-indigo-800">{operatorMessage.content}</p>
          </div>
        ) : isOperator ? (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-gray-700 mb-2">답변 작성</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const answer = e.target.elements.answer.value;
              if (answer.trim()) {
                onAnswerSubmit(answer);
              }
            }}>
              <textarea 
                name="answer"
                className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none mb-2" 
                placeholder="답변을 입력하세요..." 
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm">답변 등록</Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 mb-3 text-center">
            <p className="text-sm text-gray-500">답변 대기 중입니다.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BoardDetail;
