import { useState } from "react";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Card, Input, Button } from "../../components/ui";

const LoginPage = ({ onLogin, onGoRegister }) => {
  const [isOperator, setIsOperator] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><MessageSquare size={22} className="text-white" /></div>
            <h1 className="text-2xl font-bold text-gray-900">HelpDesk</h1>
          </div>
          <p className="text-gray-500 text-sm">소규모 판매자를 위한 고객지원 플랫폼</p>
        </div>
        <Card className="p-6">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button onClick={() => setIsOperator(false)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isOperator ? "bg-white shadow text-indigo-600" : "text-gray-500"}`}>이용자 로그인</button>
            <button onClick={() => setIsOperator(true)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isOperator ? "bg-white shadow text-indigo-600" : "text-gray-500"}`}>관리자 로그인</button>
          </div>
          <div className="space-y-4">
            <Input label="아이디" placeholder="아이디를 입력하세요" value={loginId} onChange={e => setLoginId(e.target.value)} />
            <Input label="비밀번호" type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={e => setPassword(e.target.value)} />
            <Button className="w-full" size="lg" onClick={() => onLogin(isOperator ? "operator" : "customer")}>로그인</Button>
          </div>
          <div className="mt-4 text-center">
            <button onClick={() => onGoRegister(isOperator ? "operator" : "customer")} className="text-sm text-indigo-600 hover:underline">
              {isOperator ? "관리자 회원가입" : "회원가입"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
