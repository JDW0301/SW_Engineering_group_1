import { ArrowLeft } from "lucide-react";
import { Card, Input, Button } from "../../components/ui";

const CustomerSettings = ({ setPage }) => (
  <div>
    <div className="flex items-center gap-2 mb-4"><button onClick={() => setPage("main")}><ArrowLeft size={20} /></button><h2 className="text-lg font-bold">설정</h2></div>
    <Card className="p-4 space-y-4">
      <Input label="이름" defaultValue="서재철" />
      <Input label="전화번호" defaultValue="010-1234-5678" />
      <Input label="이메일" defaultValue="sikeon3329@kunsan.ac.kr" />
      <Button className="w-full">저장</Button>
    </Card>
  </div>
);

export default CustomerSettings;
