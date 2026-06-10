import { useEffect, useRef, useState } from "react";
import { Bot, Store, Upload, FileText, Eye, X, Download, Plus } from "lucide-react";
import { updateOperatorStore } from "../../api/operator";
import { createKnowledgeFile, deleteKnowledgeFile, getOperatorSettings, saveOperatorFaqs, saveOperatorPresets } from "../../api/operatorWorkspace";
import { Card, TabButton, Input, Button } from "../../components/ui";

const OperatorSettings = ({ user, onUpdateUser, onPresetsChange }) => {
  const [tab, setTab] = useState("chatbot");
  const [knowledgeTab, setKnowledgeTab] = useState("presets");
  const [files, setFiles] = useState([]);
  const [presets, setPresets] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [settingsMessage, setSettingsMessage] = useState("");
  const fileInputRef = useRef(null);
  const iconInputRef = useRef(null);
  const [storeForm, setStoreForm] = useState({
    storeName: user?.storeName || user?.store?.name || "",
    storePhone: user?.storePhone || user?.store?.phone || "",
    address: user?.address || user?.store?.address || "",
    businessHours: user?.businessHours || user?.store?.business_hours || "",
    description: user?.description || user?.store?.description || "",
    icon: user?.store?.icon_url || null,
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
        setFaqs(data.faqs ?? []);
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

  const addPreset = () => {
    setPresets(prev => [...prev, { title: "", content: "" }]);
    setSettingsMessage("");
  };

  const removePreset = (index) => {
    setPresets(prev => prev.filter((_, presetIndex) => presetIndex !== index));
    setSettingsMessage("");
  };

  const addFaq = () => {
    setFaqs(prev => [...prev, { question: "", answer: "" }]);
    setSettingsMessage("");
  };

  const removeFaq = (index) => {
    setFaqs(prev => prev.filter((_, faqIndex) => faqIndex !== index));
    setSettingsMessage("");
  };

  const updateFaq = (index, field, value) => {
    setFaqs(prev => {
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

  const saveFaqs = async () => {
    const saved = await saveOperatorFaqs(faqs.map(faq => ({ question: faq.question || "", answer: faq.answer || "" })));
    setFaqs(saved);
    setSettingsMessage("자주 묻는 질문이 DB에 저장되었습니다.");
  };

  const readTextFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "UTF-8");
  });

  const uploadFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".txt")) {
      setSettingsMessage("txt 파일만 업로드할 수 있습니다.");
      return;
    }

    const content = await readTextFile(file);
    const savedFile = await createKnowledgeFile(file.name, content);
    setFiles(prev => [savedFile, ...prev]);
    setPreviewFile(savedFile);
    setSettingsMessage("txt 파일이 DB에 저장되었습니다.");
  };

  const uploadSelectedFile = async (event) => {
    await uploadFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const dropFile = async (event) => {
    event.preventDefault();
    setIsDraggingFile(false);
    await uploadFile(event.dataTransfer.files?.[0]);
  };

  const addFile = () => {
    fileInputRef.current?.click();
  };

  const downloadFile = (file) => {
    const blob = new Blob([file.content || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const removeFile = async (id) => {
    await deleteKnowledgeFile(id);
    setFiles(prev => prev.filter(file => file.id !== id));
    setPreviewFile(prev => (prev?.id === id ? null : prev));
  };

  const updateStoreField = (field, value) => {
    setStoreForm(prev => ({ ...prev, [field]: value }));
    setStoreError("");
    setStoreSuccess("");
  };

  const attachIcon = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStoreError("이미지 파일만 첨부할 수 있습니다.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setStoreForm(prev => ({ ...prev, icon: String(reader.result || "") }));
    reader.onerror = () => setStoreError("이미지를 읽지 못했습니다.");
    reader.readAsDataURL(file);
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
        storeIconUrl: store.icon_url,
      });
      setStoreForm({
        storeName: store.name || "",
        storePhone: store.phone || "",
        address: store.address || "",
        businessHours: store.business_hours || "",
        description: store.description || "",
        icon: store.icon_url || null,
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
          {settingsMessage && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{settingsMessage}</p>}

          {/* Knowledge Files */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3">챗봇 적용 정보 관리</h3>
            <div
              className={`border-2 border-dashed rounded-lg p-6 mb-3 text-center transition-colors ${isDraggingFile ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"}`}
              onDragOver={event => {
                event.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={dropFile}
            >
              <Upload size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">txt 파일을 드래그 앤 드롭하세요</p>
              <p className="text-xs text-gray-400 mt-1">업로드한 원본 파일명으로 저장됩니다.</p>
              <div className="mt-4 flex justify-center">
                <input ref={fileInputRef} type="file" accept=".txt,text/plain" className="hidden" onChange={uploadSelectedFile} />
                <Button onClick={addFile}>업로드</Button>
              </div>
            </div>
            <div className="space-y-2">
              {files.map(f => (
                <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-gray-400" />
                    <span className="text-sm">{f.name}</span>
                    <span className="text-xs text-gray-400">{f.uploadedAt}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPreviewFile(f)} className="p-1 hover:bg-gray-200 rounded" aria-label={`${f.name} 미리보기`}><Eye size={14} /></button>
                    <button onClick={() => downloadFile(f)} className="p-1 hover:bg-gray-200 rounded" aria-label={`${f.name} 다운로드`}><Download size={14} /></button>
                    <button onClick={() => removeFile(f.id)} className="p-1 hover:bg-red-100 rounded text-red-500"><X size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            {previewFile && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Eye size={14} />
                    <span>{previewFile.name} 미리보기</span>
                  </div>
                  <button onClick={() => setPreviewFile(null)} className="p-1 hover:bg-gray-200 rounded text-gray-500" aria-label="미리보기 닫기"><X size={14} /></button>
                </div>
                <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-white p-3 text-xs leading-5 text-gray-700">{previewFile.content || "내용이 비어 있습니다."}</pre>
              </div>
            )}
          </Card>

          {/* Presets and FAQs */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-semibold text-sm">{knowledgeTab === "presets" ? "답변 프리셋 관리" : "자주 묻는 질문 관리"}</h3>
                <p className="text-xs text-gray-400 mt-1">{knowledgeTab === "presets" ? "상담 답변에 바로 사용할 문구를 저장합니다." : "고객 챗봇 FAQ 목록에 노출할 질문과 답변을 저장합니다."}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-gray-100 p-0.5">
                  <button type="button" onClick={() => setKnowledgeTab("presets")} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${knowledgeTab === "presets" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>답변 프리셋</button>
                  <button type="button" onClick={() => setKnowledgeTab("faqs")} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${knowledgeTab === "faqs" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>자주 묻는 질문</button>
                </div>
                <Button size="sm" variant="outline" onClick={knowledgeTab === "presets" ? addPreset : addFaq}><Plus size={14} /> 추가</Button>
                <Button size="sm" variant="outline" onClick={() => { knowledgeTab === "presets" ? setPresets([]) : setFaqs([]); setSettingsMessage(""); }}>초기화</Button>
              </div>
            </div>
            <div className="space-y-3">
              {knowledgeTab === "presets" ? (
                presets.length > 0 ? presets.map((preset, i) => (
                  <div key={preset.id ?? i} className="border rounded-lg p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <Input label="제목" value={preset.title || ""} onChange={event => updatePreset(i, "title", event.target.value)} placeholder="예: 배송 안내" />
                      </div>
                      <button type="button" onClick={() => removePreset(i)} className="mt-6 rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500" aria-label={`프리셋 ${i + 1} 삭제`}><X size={14} /></button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">답변</label>
                      <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-16 resize-none mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400" value={preset.content || ""} onChange={event => updatePreset(i, "content", event.target.value)} placeholder="답변 내용" />
                    </div>
                  </div>
                )) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                    <p className="text-sm font-medium text-gray-700">저장할 답변 프리셋이 없습니다.</p>
                    <p className="mt-1 text-xs text-gray-400">자주 쓰는 상담 답변을 추가해 빠르게 불러올 수 있습니다.</p>
                    <div className="mt-3 flex justify-center">
                      <Button size="sm" variant="outline" onClick={addPreset}><Plus size={14} /> 프리셋 추가</Button>
                    </div>
                  </div>
                )
              ) : (
                faqs.length > 0 ? faqs.map((faq, i) => (
                  <div key={faq.id ?? i} className="border rounded-lg p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <Input label="질문" value={faq.question || ""} onChange={event => updateFaq(i, "question", event.target.value)} placeholder="예: 배송은 얼마나 걸리나요?" />
                      </div>
                      <button type="button" onClick={() => removeFaq(i)} className="mt-6 rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500" aria-label={`FAQ ${i + 1} 삭제`}><X size={14} /></button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">답변</label>
                      <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-16 resize-none mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400" value={faq.answer || ""} onChange={event => updateFaq(i, "answer", event.target.value)} placeholder="FAQ 답변 내용" />
                    </div>
                  </div>
                )) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                    <p className="text-sm font-medium text-gray-700">저장할 자주 묻는 질문이 없습니다.</p>
                    <p className="mt-1 text-xs text-gray-400">고객 챗봇에 보여줄 질문과 답변을 추가할 수 있습니다.</p>
                    <div className="mt-3 flex justify-center">
                      <Button size="sm" variant="outline" onClick={addFaq}><Plus size={14} /> FAQ 추가</Button>
                    </div>
                  </div>
                )
              )}
            </div>
            <Button className="w-full mt-3" onClick={knowledgeTab === "presets" ? savePresets : saveFaqs}>저장</Button>
          </Card>
        </div>
      )}

      {tab === "store" && (
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-sm">스토어 정보</h3>
          {storeSuccess && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{storeSuccess}</p>}
          {storeError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{storeError}</p>}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">스토어 아이콘</label>
            <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={attachIcon} />
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition bg-gray-50"
                onClick={() => iconInputRef.current?.click()}
              >
                {storeForm.icon && storeForm.icon !== ""
                  ? <img src={storeForm.icon} alt="스토어 아이콘" className="w-full h-full object-cover" />
                  : <Store size={24} className="text-gray-300" />}
              </div>
              <div className="flex flex-col gap-1">
                <Button size="sm" variant="outline" onClick={() => iconInputRef.current?.click()}>이미지 선택</Button>
                {storeForm.icon && <button type="button" className="text-xs text-red-400 hover:text-red-600" onClick={() => updateStoreField("icon", "")}>제거</button>}
              </div>
            </div>
          </div>
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
