import { useState } from "react";
import { Clock, Plus } from "lucide-react";
import { Card, StatusBadge, Button } from "../../components/ui";
import { MOCK_ORDERS } from "../../data/mockData";

const ConsultTab = ({ store, order, supportSessions, onOpenSupportSession, createSupportSession }) => {
  const [selectingOrder, setSelectingOrder] = useState(false);
  const [chosenOrder, setChosenOrder] = useState(order || null);
  const storeOrders = MOCK_ORDERS.filter(o => o.storeId === store.id);
  const activeSupport = supportSessions.find(session => session.storeId === store.id && session.status === "IN_PROGRESS");

  const startConsult = () => {
    const now = new Date().toLocaleString();
    const newSession = createSupportSession({
      title: chosenOrder ? `${chosenOrder.productName} 관련 상담` : "일반 상담",
      store,
      order: chosenOrder,
      source: "manual",
      initialMessages: [{ sender: "system", content: "상담이 시작되었습니다.", time: now }],
    });
    onOpenSupportSession(newSession.id);
  };

  return (
    <div>
      <div className="bg-indigo-50 rounded-lg p-3 mb-4 text-sm">
        <p className="font-medium text-indigo-700 flex items-center gap-1"><Clock size={14} /> 상담 가능 시간</p>
        <p className="text-indigo-600 mt-1">{store.operatingHours}</p>
      </div>

      {activeSupport ? (
        <Card className="p-4" onClick={() => onOpenSupportSession(activeSupport.id)}>
          <p className="text-sm font-medium mb-1">진행 중인 상담</p>
          <p className="text-xs text-gray-500">{activeSupport.title}</p>
          <div className="flex justify-between items-center mt-2">
            <StatusBadge status={activeSupport.status} />
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
