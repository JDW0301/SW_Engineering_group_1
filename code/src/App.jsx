import { useEffect, useState } from "react";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CustomerApp from "./pages/customer/CustomerApp";
import OperatorApp from "./pages/operator/OperatorApp";
import {
  clearAuthTokens,
  getAccessToken,
  getMe,
  getRefreshToken,
  login,
  logout,
  refresh,
  saveAuthTokens,
  signupCustomer,
  signupOperator,
} from "./api/auth";

// ─── Main App ────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [registerType, setRegisterType] = useState(null);
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initializeSession = async () => {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!accessToken || !refreshToken) {
        return;
      }

      try {
        const { user } = await getMe(accessToken);
        setScreen(user.role === "OPERATOR" ? "operator" : "customer");
      } catch {
        try {
          const refreshed = await refresh({ refreshToken });
          saveAuthTokens(refreshed.accessToken, refreshed.refreshToken);
          setScreen(refreshed.user.role === "OPERATOR" ? "operator" : "customer");
        } catch {
          clearAuthTokens();
        }
      }
    };

    initializeSession();
  }, []);

  const handleLogin = async ({ role, loginId, password }) => {
    setAuthError("");
    setIsSubmitting(true);

    try {
      const result = await login({ loginId, password });
      if (role === "operator" && result.user.role !== "OPERATOR") {
        throw new Error("관리자 계정으로 로그인해 주세요.");
      }

      if (role === "customer" && result.user.role !== "CUSTOMER") {
        throw new Error("이용자 계정으로 로그인해 주세요.");
      }

      saveAuthTokens(result.accessToken, result.refreshToken);
      setScreen(result.user.role === "OPERATOR" ? "operator" : "customer");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async ({ type, form }) => {
    setAuthError("");
    setIsSubmitting(true);

    try {
      if (type === "operator") {
        await signupOperator(form);
      } else {
        await signupCustomer(form);
      }

      setScreen("login");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch {
    } finally {
      clearAuthTokens();
      setScreen("login");
    }
  };

  if (screen === "login") return <LoginPage onLogin={handleLogin} onGoRegister={type => { setRegisterType(type); setAuthError(""); setScreen("register"); }} error={authError} isSubmitting={isSubmitting} />;
  if (screen === "register") return <RegisterPage type={registerType} onBack={() => { setAuthError(""); setScreen("login"); }} onRegister={handleRegister} error={authError} isSubmitting={isSubmitting} />;
  if (screen === "customer") return <CustomerApp onLogout={handleLogout} />;
  if (screen === "operator") return <OperatorApp onLogout={handleLogout} />;
  return null;
}
