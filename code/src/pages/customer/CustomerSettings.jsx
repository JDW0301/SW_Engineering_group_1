import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Card, Input, Button } from "../../components/ui";

const CustomerSettings = ({ setPage, user, onUpdateUser }) => {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setEmail(user?.email || "");
  }, [user]);

  const handleSave = () => {
    if (onUpdateUser) {
      onUpdateUser({ name, phone, email });
      alert("저장되었습니다.");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><button onClick={() => setPage("main")}><ArrowLeft size={20} /></button><h2 className="text-lg font-bold">설정</h2></div>
      <Card className="p-4 space-y-4">
        <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="전화번호" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button className="w-full" onClick={handleSave}>저장</Button>
      </Card>
    </div>
  );
};

export default CustomerSettings;
