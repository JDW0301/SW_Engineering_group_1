import { useState } from "react";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CustomerApp from "./pages/customer/CustomerApp";
import OperatorApp from "./pages/operator/OperatorApp";

// ─── Main App ────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [registerType, setRegisterType] = useState(null);

  if (screen === "login") return <LoginPage onLogin={role => setScreen(role)} onGoRegister={type => { setRegisterType(type); setScreen("register"); }} />;
  if (screen === "register") return <RegisterPage type={registerType} onBack={() => setScreen("login")} onRegister={() => setScreen("login")} />;
  if (screen === "customer") return <CustomerApp onLogout={() => setScreen("login")} />;
  if (screen === "operator") return <OperatorApp onLogout={() => setScreen("login")} />;
  return null;
}
