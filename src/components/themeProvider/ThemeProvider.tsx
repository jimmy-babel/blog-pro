"use client"
import { ThemeProvider } from "next-themes";
import React, { useEffect, useState } from 'react'
type Props = {
  children: React.ReactNode;
};
const ThemeProviderCmpt = ({ children }: Props) => {
  const [isMounted, setIsMounted] = useState(false);
  
  // 确保在客户端挂载后再渲染主题，避免服务端和客户端不匹配
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // 在客户端挂载前，返回null或简单的包装器
  if (!isMounted) {
    return <>{children}</>;
  }
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      storageKey="my-app-theme"
      enableSystem={true}
      enableColorScheme={false} // 禁用自动添加 color-scheme 样式（避免服务端无此样式）
      disableTransitionOnChange={true} // 启用此选项以减少水合闪烁和不匹配
    > 
      {children}
    </ThemeProvider>
  )
}

export default ThemeProviderCmpt;