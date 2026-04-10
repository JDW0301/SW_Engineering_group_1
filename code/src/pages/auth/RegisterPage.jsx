import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Card, Input, Button } from "../../components/ui";

const RegisterPage = ({ type, onBack, onRegister }) => {
  const [form, setForm] = useState(type === "operator" ? { storeName: "", category: "의류", name: "", loginId: "", password: "", phone: "" } : { name: "", loginId: "", password: "", phone: "" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-6">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft size={16} /> 돌아가기</button>
          <h2 className="text-xl font-bold mb-6">{type === "operator" ? "관리자 회원가입" : "이용자 회원가입"}</h2>
          <div className="space-y-4">
            {type === "operator" ? (<>
              <Input label="스토어명" value={form.storeName} onChange={e => set("storeName", e.target.value)} placeholder="스토어 이름" />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">카테고리</label>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.category} onChange={e => set("category", e.target.value)}>
                  <option>의류</option><option>음식</option><option>전자기기</option><option>생활용품</option><option>기타</option>
                </select>
              </div>
              <Input label="대표자명" value={form.name} onChange={e => set("name", e.target.value)} placeholder="이름" />
              <Input label="아이디" value={form.loginId} onChange={e => set("loginId", e.target.value)} placeholder="아이디" />
              <Input label="비밀번호" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="비밀번호" />
              <Input label="전화번호" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="010-0000-0000" />
            </>) : (<>
              <Input label="이름" value={form.name} onChange={e => set("name", e.target.value)} placeholder="이름" />
              <Input label="아이디" value={form.loginId} onChange={e => set("loginId", e.target.value)} placeholder="아이디" />
              <Input label="비밀번호" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="비밀번호" />
              <Input label="전화번호" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="010-0000-0000" />
            </>)}
            <Button className="w-full" size="lg" onClick={onRegister}>가입하기</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
