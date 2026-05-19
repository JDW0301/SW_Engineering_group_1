import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { updateCustomerProfile } from "../../api/auth";
import { Card, Input, Button } from "../../components/ui";

const CustomerSettings = ({ setPage, user, onUpdateUser }) => {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setEmail(user?.email || "");
  }, [user]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const { user } = await updateCustomerProfile({ name, phone, email });
      onUpdateUser?.(user);
      setSuccess("저장되었습니다.");
    } catch (saveError) {
      setError(saveError.message || "저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><button onClick={() => setPage("main")}><ArrowLeft size={20} /></button><h2 className="text-lg font-bold">설정</h2></div>
      <Card className="p-4 space-y-4">
        {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="전화번호" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button className="w-full" onClick={handleSave} disabled={isSaving}>{isSaving ? "저장 중..." : "저장"}</Button>
      </Card>
    </div>
  );
};

export default CustomerSettings;
