import { useState } from "react";
import { Clock, Plus } from "lucide-react";
import { Card, StatusBadge, Button } from "../../components/ui";
import { MOCK_ORDERS } from "../../data/mockData";

const ConsultTab = ({ store, order, inquiries, setInquiries, onOpenInquiry, chatbotHistory = [], clearChatbotHistory }) => {
  const [selectingOrder, setSelectingOrder] = useState(false);
  const [chosenOrder, setChosenOrder] = useState(order || null);
  const storeOrders = MOCK_ORDERS.filter(o => o.storeId === store.id);
  const activeInq = inquiries.find(i => i.storeId === store.id && i.status === "IN_PROGRESS");

  const startConsult = () => {
    const handoffMessages = chatbotHistory.length > 0
      ? [
          { id: 1, sender: "system", content: "챗봇에서 상담으로 전환되었습니다." },
          ...chatbotHistory.filter(m => m.sender !== "bot").map((m, idx) => ({
            id: idx + 2, sender: "customer", content: m.content, time: new Date().toLocaleString()
          })),
          { id: chatbotHistory.length + 2, sender: "system", content: `[챗봇 대화 요약] 고객이 챗봇에서 ${chatbotHistory.filter(m => m.sender === "user").length}건의 질문을 했으며, 해결되지 않아 상담사 연결을 요청했습니다.` }
        ]
      : [{ id: 1, sender: "system", content: "상담이 시작되었습니다." }];

    const newInq = {
      id: inquiries.length + 1, storeId: store.id, storeName: store.name, type: "상담",
      status: "IN_PROGRESS", title: chosenOrder ? `${chosenOrder.productName} 관련 상담` : "일반 상담",
      orderId: chosenOrder?.id, createdAt: new Date().toLocaleString(), lastMessageAt: new Date().toLocaleString(),
      messages: handoffMessages
    };
    setInquiries(p => [...p, newInq]);
    onOpenInquiry(newInq);
    if (clearChatbotHistory) clearChatbotHistory();
  };

  return (
    <div>
      <div className="bg-indigo-50 rounded-lg p-3 mb-4 text-sm">
        <p className="font-medium text-indigo-700 flex items-center gap-1"><Clock size={14} /> 상담 가능 시간</p>
        <p className="text-indigo-600 mt-1">{store.operatingHours}</p>
      </div>

      {activeInq ? (
        <Card className="p-4" onClick={() => onOpenInquiry(activeInq)}>
          <p className="text-sm font-medium mb-1">진행 중인 상담</p>
          <p className="text-xs text-gray-500">{activeInq.title}</p>
          <div className="flex justify-between items-center mt-2">
            <StatusBadge status={activeInq.status} />
          </div>
        </Card>
      ) : (
        <div>
          <div onClick={() => setSelectingOrder(!selectingOrder)} className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition mb-3">
            <Plus size={20} className="mx-auto text-gray-400 mb-1" />
            <p className="text-sm text-gray-500">{chosenOrder ? chosenOrder.productName : "상담할 주문 내역 선택"}</p>
          </div>
          {selectingOrder && (
            <div className="mb-3 space-y-2">
              <button onClick={() => { setChosenOrder(null); setSelectingOrder(false); }} className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">일반 상담</button>
              {storeOrders.map(o => (
                <button key={o.id} onClick={() => { setChosenOrder(o); setSelectingOrder(false); }} className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">
                  {o.productName} ({o.orderNumber})
                </button>
              ))}
            </div>
          )}
          <Button className="w-full" onClick={startConsult}>상담 시작</Button>
        </div>
      )}
    </div>
  );
};

export default ConsultTab;
