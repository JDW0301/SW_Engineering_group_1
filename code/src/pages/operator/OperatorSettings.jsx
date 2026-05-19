import { useEffect, useState } from "react";
import { Bot, Store, Upload, FileText, Eye, X } from "lucide-react";
import { updateOperatorStore } from "../../api/operator";
import { createKnowledgeFile, deleteKnowledgeFile, getOperatorSettings, saveOperatorPresets } from "../../api/operatorWorkspace";
import { Card, TabButton, Input, Button } from "../../components/ui";

const OperatorSettings = ({ user, onUpdateUser, onPresetsChange }) => {
  const [tab, setTab] = useState("chatbot");
  const [files, setFiles] = useState([]);
  const [presets, setPresets] = useState([]);
  const [fileName, setFileName] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [storeForm, setStoreForm] = useState({
    storeName: user?.storeName || user?.store?.name || "",
    storePhone: user?.storePhone || user?.store?.phone || "",
    address: user?.address || user?.store?.address || "",
    businessHours: user?.businessHours || user?.store?.business_hours || "",
    description: user?.description || user?.store?.description || "",
  });
  const [storeError, setStoreError] = useState("");
  const [storeSuccess, setStoreSuccess] = useState("");
  const [isStoreSaving, setIsStoreSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    getOperatorSettings()
      .then(data => {
        if (ignore) return;
        setFiles(data.files ?? []);
        setPresets(data.presets ?? []);
        onPresetsChange?.(data.presets ?? []);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, [onPresetsChange]);

  const updatePreset = (index, field, value) => {
    setPresets(prev => {
      const next = [...prev];
      next[index] = { ...(next[index] || {}), [field]: value };
      return next;
    });
    setSettingsMessage("");
  };

  const savePresets = async () => {
    const saved = await saveOperatorPresets(presets.map(preset => ({ title: preset.title || "", content: preset.content || "" })));
    setPresets(saved);
    onPresetsChange?.(saved);
    setSettingsMessage("프리셋이 DB에 저장되었습니다.");
  };

  const addFile = async () => {
    if (!fileName.trim()) return;
    const file = await createKnowledgeFile(fileName.trim());
    setFiles(prev => [file, ...prev]);
    setFileName("");
    setSettingsMessage("지식 파일이 DB에 저장되었습니다.");
  };

  const removeFile = async (id) => {
    await deleteKnowledgeFile(id);
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const updateStoreField = (field, value) => {
    setStoreForm(prev => ({ ...prev, [field]: value }));
    setStoreError("");
    setStoreSuccess("");
  };

  const saveStore = async () => {
    setStoreError("");
    setStoreSuccess("");
    setIsStoreSaving(true);

    try {
      const { store } = await updateOperatorStore(storeForm);
      onUpdateUser?.({
        storeName: store.name,
        storePhone: store.phone,
        address: store.address,
        businessHours: store.business_hours,
        description: store.description,
        store,
      });
      setStoreForm({
        storeName: store.name || "",
        storePhone: store.phone || "",
        address: store.address || "",
        businessHours: store.business_hours || "",
        description: store.description || "",
      });
      setStoreSuccess("스토어 정보가 저장되었습니다.");
    } catch (error) {
      setStoreError(error.message || "스토어 정보를 저장하지 못했습니다.");
    } finally {
      setIsStoreSaving(false);
    }
  };

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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-3">
              <Upload size={24} className="mx-auto text-gray-400 mb-2" />
              <div className="flex gap-2">
                <Input value={fileName} onChange={event => setFileName(event.target.value)} placeholder="저장할 txt 파일명" />
                <Button onClick={addFile}>추가</Button>
              </div>
            </div>
            {settingsMessage && <p className="text-sm text-green-600 mb-2">{settingsMessage}</p>}
            <div className="space-y-2">
              {files.map(f => (
                <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-gray-400" />
                    <span className="text-sm">{f.name}</span>
                    <span className="text-xs text-gray-400">{f.uploadedAt}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-gray-200 rounded"><Eye size={14} /></button>
                    <button onClick={() => removeFile(f.id)} className="p-1 hover:bg-red-100 rounded text-red-500"><X size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Presets */}
          <Card className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm">프리셋 관리 (최대 5개)</h3>
              <Button size="sm" variant="outline" onClick={() => { setPresets([]); setSettingsMessage(""); }}>초기화</Button>
            </div>
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="border rounded-lg p-3">
                  <Input label={`프리셋 제목 ${i + 1}`} value={presets[i]?.title || ""} onChange={event => updatePreset(i, "title", event.target.value)} placeholder="예: 배송 안내" />
                  <div className="mt-2">
                    <label className="text-sm font-medium text-gray-700">답변</label>
                    <textarea className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none mt-1" value={presets[i]?.content || ""} onChange={event => updatePreset(i, "content", event.target.value)} placeholder="답변 내용" />
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-3" onClick={savePresets}>저장</Button>
          </Card>
        </div>
      )}

      {tab === "store" && (
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-sm">스토어 정보</h3>
          {storeSuccess && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{storeSuccess}</p>}
          {storeError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{storeError}</p>}
          <Input label="스토어명" value={storeForm.storeName} onChange={event => updateStoreField("storeName", event.target.value)} placeholder="스토어명을 입력하세요" />
          <Input label="전화번호" value={storeForm.storePhone} onChange={event => updateStoreField("storePhone", event.target.value)} />
          <Input label="주소" value={storeForm.address} onChange={event => updateStoreField("address", event.target.value)} />
          <Input label="상담 운영 시간" value={storeForm.businessHours} onChange={event => updateStoreField("businessHours", event.target.value)} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">소개글</label>
            <textarea className="border rounded-lg px-3 py-2 text-sm h-24 resize-none" value={storeForm.description} onChange={event => updateStoreField("description", event.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1"><Eye size={16} /> 프리뷰</Button>
            <Button className="flex-1" onClick={saveStore} disabled={isStoreSaving}>{isStoreSaving ? "저장 중..." : "저장"}</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OperatorSettings;
