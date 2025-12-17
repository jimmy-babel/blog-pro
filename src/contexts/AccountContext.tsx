"use client";
import { createContext, useContext, useEffect } from "react";
// import { ThemeProvider } from 'next-themes'

// 定义Context类型
type AccountContextType = {
  account: string | null;
};

// 创建Context（默认值为null）
const AccountContext = createContext<AccountContextType | undefined>(undefined);

// 提供Context的Provider组件
export function AccountProvider({
  children,
  account,
}: {
  children: React.ReactNode;
  account: string;
}) {
  // 初始化时直接同步（不依赖 useEffect）
  if (typeof window !== 'undefined') { // 避免服务端报错
    window.__NEXT_ACCOUNT__ = account;
    if (account !== localStorage.getItem('account')) {
      localStorage.setItem('account', account);
    }
  }

  // 客户端初始化时，将account存入全局变量
  useEffect(() => {
    try{
      console.log('AccountProvider',account);
      window.__NEXT_ACCOUNT__ = account;
      if (account !== localStorage.getItem('account')) {
        localStorage.setItem('account', account);
      }
    }catch(e){
      console.error('AccountProvider useEffect error',e);
    }
  }, [account]);

  return (
    //   <ThemeProvider
    //     attribute="class" // 推荐用 class 控制样式（适配 CSS/Tailwind）
    //     defaultTheme="dark" // 默认主题：system（跟随系统）/ light / dark
    //     storageKey="my-blog-theme" // 本地存储键名（默认是 "theme"，可选）
    //     enableSystem={true} // 是否启用系统主题检测（默认 true）
    //     disableTransitionOnChange={false} // 切换主题时是否禁用过渡动画（默认 false）
    //   >
    // </ThemeProvider>
    <AccountContext.Provider value={{ account }}>
      {children}
    </AccountContext.Provider>
  );
}

// 自定义Hook，简化使用（强制要求在Provider内使用）
// 页面可以用React.use获取account动态传参，所以useAccount可以给非页面组件使用
export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context.account;
}