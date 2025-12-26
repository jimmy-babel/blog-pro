'use client';
import React, { useState,useEffect, useRef } from "react";
import { usePathname } from 'next/navigation';
import {useJumpAction,useCheckUser} from "@/lib/hooks/base-hooks";
import { useAppSelector,useAppDispatch } from "@/redux/hooks";
import Avatar from "@/components/common/custom-antd/Avatar";
import { useTheme } from 'next-themes';
import { MoonOutlined,SunOutlined } from '@ant-design/icons';
import './nav.css';
// import { useAuth } from "@/contexts/AuthContext";

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
  const {checkUser} = useCheckUser();
  const { resolvedTheme, setTheme } = useTheme();
  const [selectedKeys, setSelectedKeys] = useState<string>(""); 
  const pathname = usePathname();
  // const { isLogin, isBlogger, updateAuth } = useAuth();
  const user = useAppSelector((state) => state.user);
  const curBlogger = useAppSelector((state) => state.curBlogger);
  const dispatch = useAppDispatch();
  const [avatar_url,setAvatar_url] = useState<string>("");
  const [inited,setInited] = useState<boolean>(false);

  useEffect(() => {
    checkUser()
    .then((res) => {
      if(res?.data){
        dispatch({ type: "user/init", payload:res?.data});
      }
    });
  }, []);

  useEffect(() => {
    getBloggerInfo();
    async function getBloggerInfo(){
      try{
        const res = await fetch(
          `/api/blogger/get-blogger-info?blogger=${window.__NEXT_ACCOUNT__}`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        setAvatar_url((data?.data || {}).avatar_url || "/avatar.png");
      }catch(error){
        setAvatar_url("");
      } finally{
        setInited(true);
      }
    }
  }, []);

  useEffect(() => {
    if(inited){
      const curBloggerInfo = curBlogger?.curBloggerInfo as any;
      setAvatar_url(curBloggerInfo?.avatar_url || "/avatar.png");
    }
  }, [curBlogger]);
  
  useEffect(()=>{
    let extra = [];
    if(!user?.isLogin){
      extra.push({ key: "login", name: "登录", url: `/auth`, type: "from" });
    }
    if(user?.isBlogger){
      extra.push({ key: "admin", name: "后台管理", url: `admin` });
    }
    if(user?.isLogin){
      extra.push({ key: "logout", name: "退出登录", url: `/auth`, type: "from" });
    }
    // console.log('nav useAppSelector watch',user,navList,extra);
    setList([...(navList || []),...extra]);
  },[user])
  
  // 根据登录状态更新导航列表
  // useEffect(() => {
  //   //console.log('useAuth watch',isLogin,'isBlogger',isBlogger);
  //   let extra = [];
  //   if(!isLogin){
  //     extra.push({ key: "login", name: "登录", url: `/auth`, type: "from" });
  //   }
  //   if(isBlogger){
  //     extra.push({ key: "admin", name: "后台管理", url: `admin` });
  //   }
  //   setList([...(navList || []),...extra]);
  // }, [navList, isLogin, isBlogger]);
  
  // useEffect(() => {
  //   updateAuth();
  // }, []);

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

  // 给scroll闭包函数使用showBgRef.current
  useEffect(() => {
    showBgRef.current = showBg;
  }, [showBg]);

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

  const menuClick = (item:NavItem)=>{
    // const updatePwd = async ()=>{
    //   const { data, error } = await supabase.auth.updateUser({
    //     password: "" // 修改密码
    //   });
    //   console.log('res',data,error);
    // }
    // updatePwd();
    // return
    
    if(item.key == 'logout'){
      dispatch({ type: "user/clearUserInfo" });
    }
    jumpAction(item.url||"",{type:item.type||"blog_auto"});
  }
  
  const toggleTheme = (curType:string)=>{
    //console.log('toggleTheme',curType,resolvedTheme);
    setTheme(curType == 'dark' ? 'light':'dark');
  }
  return (
    <>
      <div className={`nav-box sticky z-[10] left-0 top-0 w-full h-[var(--nav-bar-height)]`}>
        <div className="anim-op-y flex justify-between items-center relative h-full w-full pl-10 pr-10 z-[2]">
          <div className="cursor-pointer" onClick={()=>menuClick(list[0])}>
            <Avatar size={55} src={avatar_url || ""}></Avatar>
          </div>
          {/* {curAccount.toUpperCase()?<div>
            {userProfile?.full_name.toUpperCase() != curAccount.toUpperCase() ? <div>WELCOME {curAccount.toUpperCase()} BLOG</div> : <div>Hello,{userProfile.full_name}</div>}
          </div>:null} */}
          <div className="flex-1 flex items-center justify-center">
            {list?.map((item, index) => (
              <div className="px-2.5" key={index}>
                <div className={`transition-all duration-300 ${selectedKeys == item.key?'scale-[1.2]':''}`}>
                  <div className={`cursor-pointer anim-hover-y ${selectedKeys == item.key?'text-line':''}`} onClick={()=>menuClick(item)}>{item.name}</div>
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
