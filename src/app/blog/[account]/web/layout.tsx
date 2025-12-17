import React from "react";
// import HeaderContent from '@/components/header-content';
import SetLayout from "@/components/set-layout";

export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const extraClass = `w-full`;
  return (
    <>
      <SetLayout extraClass={extraClass} pageScroll safeArea>
        <div className="min-h-[calc(100vh-var(--nav-bar-height))]">
            <div className="blog-background blog-background-top"></div>
            <div className="blog-background blog-background-bottom"></div>
            {children}
        </div>
      </SetLayout>
    </>
  );
}
