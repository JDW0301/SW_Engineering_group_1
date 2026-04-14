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
  const [authSuccess, setAuthSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState(null);

  const handleUpdateUser = (updatedFields) => {
    if (!user) return;
    const newUser = { ...user, ...updatedFields };
    setUser(newUser);
    const userId = user.loginId || user.id;
    if (userId) {
      try {
        const saved = JSON.parse(localStorage.getItem(`profile_${userId}`) || "{}");
        localStorage.setItem(`profile_${userId}`, JSON.stringify({ ...saved, ...updatedFields }));
      } catch (e) {}
    }
  };

  useEffect(() => {
    const initializeSession = async () => {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!accessToken || !refreshToken) {
        setIsInitializing(false);
        return;
      }

      try {
        const { user } = await getMe(accessToken);
        const userId = user.loginId || user.id;
        let savedProfile = {};
        if (userId) {
          try {
            savedProfile = JSON.parse(localStorage.getItem(`profile_${userId}`) || "{}");
          } catch (e) {}
        }
        setUser({ ...user, ...savedProfile });
        setScreen(user.role === "OPERATOR" ? "operator" : "customer");
      } catch {
        try {
          const refreshed = await refresh({ refreshToken });
          saveAuthTokens(refreshed.accessToken, refreshed.refreshToken);
          const userId = refreshed.user.loginId || refreshed.user.id;
          let savedProfile = {};
          if (userId) {
            try {
              savedProfile = JSON.parse(localStorage.getItem(`profile_${userId}`) || "{}");
            } catch (e) {}
          }
          setUser({ ...refreshed.user, ...savedProfile });
          setScreen(refreshed.user.role === "OPERATOR" ? "operator" : "customer");
        } catch {
          clearAuthTokens();
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSession();
  }, []);

  const handleLogin = async ({ role, loginId, password }) => {
    setAuthError("");
    setAuthSuccess("");
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
      const userId = result.user.loginId || result.user.id;
      let savedProfile = {};
      if (userId) {
        try {
          savedProfile = JSON.parse(localStorage.getItem(`profile_${userId}`) || "{}");
        } catch (e) {}
      }
      setUser({ ...result.user, ...savedProfile });
      setScreen(result.user.role === "OPERATOR" ? "operator" : "customer");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async ({ type, form }) => {
    setAuthError("");
    setAuthSuccess("");
    setIsSubmitting(true);

    try {
      if (type === "operator") {
        await signupOperator(form);
      } else {
        await signupCustomer(form);
      }

      setAuthSuccess("회원가입이 완료되었습니다. 로그인해 주세요.");
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
      setUser(null);
      setScreen("login");
    }
  };

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">로딩 중...</div>;
  }

  if (screen === "login") return <LoginPage onLogin={handleLogin} onGoRegister={type => { setRegisterType(type); setAuthError(""); setAuthSuccess(""); setScreen("register"); }} error={authError} success={authSuccess} isSubmitting={isSubmitting} initialIsOperator={registerType === "operator"} />;
  if (screen === "register") return <RegisterPage type={registerType} onBack={() => { setAuthError(""); setAuthSuccess(""); setScreen("login"); }} onRegister={handleRegister} error={authError} isSubmitting={isSubmitting} />;
  if (screen === "customer") return <CustomerApp onLogout={handleLogout} user={user} onUpdateUser={handleUpdateUser} />;
  if (screen === "operator") return <OperatorApp onLogout={handleLogout} user={user} />;
  return null;
}
