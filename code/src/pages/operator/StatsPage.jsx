import { useState } from "react";
import { Card } from "../../components/ui";

const StatsPage = ({ inquiries }) => {
  const [ratePeriod, setRatePeriod] = useState("7일");
  const [countPeriod, setCountPeriod] = useState("1일");
  const [inquiryRatePeriod, setInquiryRatePeriod] = useState("7일");

  const filterByPeriod = (list, period) => {
    const now = new Date();
    const days = period === "1일" ? 1 : period === "7일" ? 7 : period === "30일" ? 30 : 9999;
    return list.filter(i => {
      const d = new Date(i.createdAt);
      return (now - d) / 86400000 <= days;
    });
  };

  const consultFiltered = filterByPeriod(inquiries.filter(i => i.type === "상담"), ratePeriod);
  const consultTotal = consultFiltered.length;
  const consultResolved = consultFiltered.filter(i => i.status === "RESOLVED").length;
  const consultRate = consultTotal ? Math.round((consultResolved / consultTotal) * 100) : 0;

  const inquiryFiltered = filterByPeriod(inquiries.filter(i => i.type === "문의"), inquiryRatePeriod);
  const inquiryTotal = inquiryFiltered.length;
  const inquiryResolved = inquiryFiltered.filter(i => i.status === "RESOLVED").length;
  const inquiryRate = inquiryTotal ? Math.round((inquiryResolved / inquiryTotal) * 100) : 0;

  const countFiltered = filterByPeriod(inquiries, countPeriod);

  const avgResponseTime = (() => {
    const times = inquiries.filter(i => i.messages && i.messages.length >= 2).map(inq => {
      const firstCustomer = inq.messages.find(m => m.sender === "customer");
      const firstOperator = inq.messages.find(m => m.sender === "operator");
      if (!firstCustomer || !firstOperator || !firstCustomer.time || !firstOperator.time) return null;
      const diff = new Date(firstOperator.time) - new Date(firstCustomer.time);
      return diff > 0 ? diff : null;
    }).filter(Boolean);
    if (times.length === 0) return "N/A";
    const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
    const mins = Math.round(avgMs / 60000);
    return mins > 0 ? `${mins}분` : "1분 미만";
  })();

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">통계</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 상담 완료율 */}
        <Card className="p-6 text-center">
          <div className="relative w-28 h-28 mx-auto mb-3">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray={`${consultRate} ${100 - consultRate}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{consultResolved}/{consultTotal}</span>
              <span className="text-xs text-gray-400">{consultRate}%</span>
            </div>
          </div>
          <p className="font-medium text-sm">상담 완료율</p>
          <div className="flex justify-center gap-1 mt-2">
            {["7일", "30일", "전체"].map(l => <button key={l} onClick={() => setRatePeriod(l)} className={`text-xs px-2 py-0.5 rounded ${ratePeriod === l ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}>{l}</button>)}
          </div>
        </Card>

        {/* 문의 완료율 */}
        <Card className="p-6 text-center">
          <div className="relative w-28 h-28 mx-auto mb-3">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray={`${inquiryRate} ${100 - inquiryRate}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{inquiryResolved}/{inquiryTotal}</span>
              <span className="text-xs text-gray-400">{inquiryRate}%</span>
            </div>
          </div>
          <p className="font-medium text-sm">문의 완료율</p>
          <div className="flex justify-center gap-1 mt-2">
            {["7일", "30일", "전체"].map(l => <button key={l} onClick={() => setInquiryRatePeriod(l)} className={`text-xs px-2 py-0.5 rounded ${inquiryRatePeriod === l ? "bg-green-100 text-green-600" : "text-gray-400 hover:text-gray-600"}`}>{l}</button>)}
          </div>
        </Card>

        {/* 문의량 */}
        <Card className="p-6 text-center">
          <p className="text-4xl font-bold text-indigo-600 mb-2">{countFiltered.length}</p>
          <p className="font-medium text-sm">총 문의량</p>
          <div className="flex justify-center gap-1 mt-2">
            {["1일", "7일", "30일", "전체"].map(l => <button key={l} onClick={() => setCountPeriod(l)} className={`text-xs px-2 py-0.5 rounded ${countPeriod === l ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}>{l}</button>)}
          </div>
        </Card>

        {/* 평균 응답시간 */}
        <Card className="p-6 text-center">
          <p className="text-4xl font-bold text-green-600 mb-2">{avgResponseTime}</p>
          <p className="font-medium text-sm">평균 첫 응답시간</p>
          <p className="text-xs text-gray-400 mt-1">고객 메시지 → 상담사 첫 응답</p>
        </Card>

        {/* 챗봇 전환율 */}
        <Card className="p-6 text-center">
          <p className="text-4xl font-bold text-amber-600 mb-2">35%</p>
          <p className="font-medium text-sm">챗봇 → 상담 전환율</p>
        </Card>
      </div>
    </div>
  );
};

export default StatsPage;
