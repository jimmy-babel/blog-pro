import React from "react";
import SetLayout from "@/components/common/set-layout/set-layout";
import { AccountProvider } from "@/contexts/AccountContext";

type Props = {
  params: Promise<{ account: string }>;
  children: React.ReactNode;
};
export default async function WebLayout({ children, params }: Props) {
  const { account } = await params; // 服务端直接获取路由参数
  const extraClass = `w-full`;
  return (
    <>
      <AccountProvider account={account}>
        <SetLayout extraClass={extraClass} pageScroll safeArea>
          <div className="min-h-[calc(100vh-var(--nav-bar-height))]">
            <div className="blog-background blog-background-top"></div>
            <div className="blog-background blog-background-bottom"></div>
            {children}
          </div>
        </SetLayout>
      </AccountProvider>
    </>
  );
}
