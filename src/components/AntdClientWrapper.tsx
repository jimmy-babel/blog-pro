//AntdClientWrapper.tsx
"use client"; // 客户端标识，处理Antd的客户端渲染逻辑

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, message } from "antd";
import "@ant-design/v5-patch-for-react-19";
import React, { useEffect } from "react";
import type { AliasToken } from "antd/es/theme/interface";
// const zIndexPopup: AliasToken["zIndexPopup"] = 9999;

// 主题配置（可在服务端定义后传递，这里简化直接写在客户端）
const customTheme = {
  token: {
    /* 这里是你的全局 token */
  },
  components: {
    Menu: { fontSize: 16 },
    Card: { bodyPadding: 0, borderRadius: 0 },
    Cascader: { controlWidth: 150 },
    // Message: {
    //   zIndexPopup: 9999,
    // },
  },
};

type Props = {
  children: React.ReactNode;
};

// 客户端组件：专门处理Antd的Registry和ConfigProvider（依赖客户端环境）
export default function AntdClientWrapper({ children }: Props) {
  // useEffect(() => {
  //   console.log('message.config');
  //   message.config({
  //     top: 300,
  //     duration: 2,
  //     maxCount: 3,
  //     rtl: true,
  //     prefixCls: "my-message",
  //   });
  // }, []);
  return (
    <AntdRegistry>
      <ConfigProvider theme={customTheme}>{children}</ConfigProvider>
    </AntdRegistry>
  );
}
