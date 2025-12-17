"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useCheckUser } from "@/lib/use-helper/base-mixin";

// 定义Context类型
type AuthContextType = {
  isLogin: boolean;
  isBlogger: boolean;
  userInfo: any;
  updateAuth: () => Promise<void>;
  clearAuth: () => void;
};

// 创建Context（默认值）
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 提供Context的Provider组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLogin, setIsLogin] = useState(false);
  const [isBlogger, setIsBlogger] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const { checkUser } = useCheckUser();

  // 更新认证状态 - 使用useCallback确保引用稳定
  const updateAuth = useCallback(async () => {
    try {
      const { data } = await checkUser();
      setIsLogin(data?.isLogin || false);
      setIsBlogger(data?.isBlogger || false);
      setUserInfo(data?.userInfo || null);
    } catch (error) {
      setIsLogin(false);
      setIsBlogger(false);
      setUserInfo(null);
    }
  }, [checkUser]);

  // 清除认证状态
  const clearAuth = () => {
    setIsLogin(false);
    setIsBlogger(false);
    setUserInfo(null);
  };

  // 初始化时检查认证状态
  useEffect(() => {
    updateAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isLogin, isBlogger, userInfo, updateAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义Hook，简化使用（强制要求在Provider内使用）
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}