"use client"
import React, { useState,useEffect } from 'react';
import {
  // MenuFoldOutlined,
  // MenuUnfoldOutlined,
  ReadOutlined,
  SunOutlined,
  UserOutlined,
  
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Menu } from 'antd';
import {useJumpAction} from "@/lib/use-helper/base-mixin";
import { usePathname } from 'next/navigation';
import "./nav.css"
type Props = {}
type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  { key: 'admin/userInfo', icon: <UserOutlined style={{ fontSize: '18px'}}  />, label: '我的信息管理' },
  { key: 'admin/articles', icon: <ReadOutlined style={{ fontSize: '18px'}} />, label: '博客文章管理' },
  { key: 'admin/lifestyles', icon: <SunOutlined style={{ fontSize: '18px'}} />, label: '生活手记管理' },
];
export default function Nav(props: Props){
  // const [collapsed, setCollapsed] = useState(false);
  const {jumpAction} = useJumpAction();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const pathname = usePathname();
  useEffect(() => {
    console.log(pathname,'pathname');
    if (!pathname) return;
    // 匹配规则：路由包含Menu的key（处理路由带后缀的情况，如 /admin/articles/1 也高亮 admin/articles）
    const matchedKey = (items.find((item:MenuItem) => 
      pathname.includes((item && item.key) as string)
    )?.key) as string | undefined;
    console.log('matchedKey',matchedKey);
    setSelectedKeys(matchedKey ? [matchedKey] : []);
  }, [pathname]);
  // const toggleCollapsed = () => {
  //   setCollapsed(!collapsed);
  // };
   // 正确定义事件处理函数：参数为 MenuInfo 类型的 info
  const menuItemOnClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    jumpAction(e.key);
  };
  return (
    <div style={{ width: 180 }}>
      {/* <Button type="primary" onClick={toggleCollapsed} style={{ marginBottom: 16 }}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button> */}
      <Menu
        selectedKeys={selectedKeys}
        onClick={menuItemOnClick}
        mode="inline"
        theme="light"
        // inlineCollapsed={collapsed}
        items={items}
      />
    </div>
  );
}