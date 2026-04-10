import { useState } from "react";
import { Bot, Store, Upload, FileText, Eye, X } from "lucide-react";
import { Card, TabButton, Input, Button } from "../../components/ui";
import { MOCK_FAQ } from "../../data/mockData";

const OperatorSettings = () => {
  const [tab, setTab] = useState("chatbot");
  const [files, setFiles] = useState([{ id: 1, name: "FAQ_안내.txt", size: "2.3KB" }, { id: 2, name: "반품정책.txt", size: "1.8KB" }]);
  const [presets, setPresets] = useState(MOCK_FAQ.slice(0, 3).map((f, i) => ({ ...f, id: i + 1 })));

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">스토어 설정</h2>
      <div className="flex border-b mb-4">
        <TabButton active={tab === "chatbot"} onClick={() => setTab("chatbot")} icon={Bot}>챗봇 관리</TabButton>
        <TabButton active={tab === "store"} onClick={() => setTab("store")} icon={Store}>스토어 관리</TabButton>
      </div>

      {tab === "chatbot" && (
        <div className="space-y-6">
          {/* Knowledge Files */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3">챗봇 적용 정보 관리</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-3 hover:border-indigo-400 cursor-pointer transition">
              <Upload size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">txt 파일을 드래그하거나 클릭하여 업로드</p>
            </div>
            <div className="space-y-2">
              {files.map(f => (
                <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-gray-400" />
                    <span className="text-sm">{f.name}</span>
                    <span className="text-xs text-gray-400">{f.size}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-gray-200 rounded"><Eye size={14} /></button>
                    <button onClick={() => setFiles(p => p.filter(x => x.id !== f.id))} className="p-1 hover:bg-red-100 rounded text-red-500"><X size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Presets */}
          <Card className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm">프리셋 관리 (최대 5개)</h3>
              <Button size="sm" variant="outline" onClick={() => setPresets([])}>초기화</Button>
            </div>
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="border rounded-lg p-3">
                  <Input label={`질문 ${i + 1}`} defaultValue={presets[i]?.question || ""} placeholder="자주 묻는 질문" />
                  <div className="mt-2">
                    <label className="text-sm font-medium text-gray-700">답변</label>
                    <textarea className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none mt-1" defaultValue={presets[i]?.answer || ""} placeholder="답변 내용" />
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-3">저장</Button>
          </Card>
        </div>
      )}

      {tab === "store" && (
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-sm">스토어 정보</h3>
          <Input label="전화번호" defaultValue="02-1234-5678" />
          <Input label="주소" defaultValue="서울시 강남구" />
          <Input label="상담 운영 시간" defaultValue="평일 09:00 ~ 18:00" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">소개글</label>
            <textarea className="border rounded-lg px-3 py-2 text-sm h-24 resize-none" defaultValue="트렌디한 의류 전문 스토어" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1"><Eye size={16} /> 프리뷰</Button>
            <Button className="flex-1">저장</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OperatorSettings;
