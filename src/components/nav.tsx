'use client';
import React, { useState,useEffect, useRef } from "react";
import { usePathname } from 'next/navigation';
import {useJumpAction} from "@/lib/use-helper/base-mixin";
import { useAuth } from "@/contexts/AuthContext";
import Avatar from "@/components/custom-antd/Avatar";
import { useTheme } from 'next-themes';
import { MoonOutlined,SunOutlined } from '@ant-design/icons';
import './nav.css';
type NavItem = { name: string; key: string; url?: string; type?: string };
type Props = {
  isPlace?:boolean,
  account?:string,
  navList?:NavItem[],
};
const Nav = ({navList}: Props) => {
  const [showBg,setShowBg] = useState(false);
  const [list , setList] = useState<NavItem[]>(navList||[]);
  const showBgRef = useRef(showBg);
  const {jumpAction} = useJumpAction();
  const { resolvedTheme, setTheme } = useTheme();
  const [selectedKeys, setSelectedKeys] = useState<string>(""); 
  const pathname = usePathname();
  const { isLogin, isBlogger, updateAuth } = useAuth();
  const [blogger,setBlogger] = useState<string>("");
  useEffect(() => {
    // console.log(pathname,'pathname');
    if (!pathname) return;
    const matchedKey = (list.find((item:NavItem) => 
      {
        if(item.key == 'home' && pathname != '/auth' && pathname?.split('/').length == 2){
          return true;
        }else if(item.key != 'home' && pathname.indexOf('admin') > -1 && item.key == 'admin'){
          return true;
        }else if(pathname.indexOf('admin') == -1 && item.key != 'home' && pathname.indexOf(item.url || "") > -1){
          return true;
        }else{
          return false;
        }
      }
    )?.key) as string | undefined;
    setSelectedKeys(matchedKey || "");
  }, [pathname,list]);

  useEffect(() => {
    setBlogger(window.__NEXT_ACCOUNT__ || "");
  }, []);

  // 给scroll闭包函数使用showBgRef.current
  useEffect(() => {
    showBgRef.current = showBg;
  }, [showBg]);

  // 根据登录状态更新导航列表
  useEffect(() => {
    //console.log('useAuth watch',isLogin,'isBlogger',isBlogger);
    let extra = [];
    if(!isLogin){
      extra.push({ key: "login", name: "登录", url: `/auth`, type: "from" });
    }
    if(isBlogger){
      extra.push({ key: "admin", name: "后台管理", url: `admin` });
    }
    setList([...(navList || []),...extra]);
  }, [navList, isLogin, isBlogger]);
  
  useEffect(() => {
    updateAuth();
  }, []);

  
  useEffect(() => {
    const handleScroll = () => {
      const currentShowBg = showBgRef.current;
      if (window.scrollY > 75) {
        !currentShowBg && setShowBg(true); //这里如果用showBg,会因为闭包的问题导致showBg一直不变  //总滑动超75像素时，backdrop背景
      } else {
        currentShowBg && setShowBg(false); //这里如果用showBg,会因为闭包的问题导致showBg一直不变  // 总滑动小于75像素时，去掉backdrop效果
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll); // 清理事件监听器
    };
  }, [showBg]);
  
  const toggleTheme = (curType:string)=>{
    //console.log('toggleTheme',curType,resolvedTheme);
    setTheme(curType == 'dark' ? 'light':'dark');
  }
  return (
    <>
      <div className={`nav-box sticky z-[10] left-0 top-0 w-full h-[var(--nav-bar-height)]`}>
        <div className="anim-op-y flex justify-between items-center relative h-full w-full pl-5 pr-5 z-[2]">
          <Avatar size={40} blogger={blogger || ""}></Avatar>
          {/* {curAccount.toUpperCase()?<div>
            {userProfile?.full_name.toUpperCase() != curAccount.toUpperCase() ? <div>WELCOME {curAccount.toUpperCase()} BLOG</div> : <div>Hello,{userProfile.full_name}</div>}
          </div>:null} */}
          <div className="flex-1 flex items-center justify-center">
            {list?.map((item, index) => (
              <div className="px-2.5" key={index}>
                <div className={`transition-all duration-300 ${selectedKeys == item.key?'scale-[1.2]':''}`}>
                  <div className={`cursor-pointer anim-hover-y ${selectedKeys == item.key?'text-line':''}`} onClick={()=>jumpAction(item.url||"",{type:item.type||"blog_auto"})}>{item.name}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="extra w-15">
            <div onClick={()=>toggleTheme(resolvedTheme||'light')}>
              {resolvedTheme == 'dark'?<MoonOutlined className="text-white cursor-pointer" />:<SunOutlined className="text-black cursor-pointer"/>}
            </div>
          </div>
        </div>
        <div className={`absolute z-[1] filter-box left-0 top-0 w-full h-full transition-all duration-300 ${showBg?'shadow-md box-shadow my-backdrop-filter':''}`}></div>
      </div>
      {/* {place && <div className="place-box w-full h-[75px]"></div>} */}
    </>
  );
};

export default Nav;
