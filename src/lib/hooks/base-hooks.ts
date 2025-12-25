'use client';
import { useRouter,usePathname} from "next/navigation"; // 公开路径导入
import { cookieGet,cookieSet } from "@/utils/cookies-set";
interface ExtraType {
  type?:string
}
// 封装 跳转方法
export function useJumpAction(){
  const router = useRouter();
  const fromPath = usePathname();
  const jumpAction = (url:string,extra:ExtraType={type:"blog_auto"})=>{
    const account = window.__NEXT_ACCOUNT__||localStorage.getItem('account') || ""
    //console.log('jumpAction',url,fromPath,extra,account);
    if(extra?.type == 'blog_auto'){ // 跳转自动添加博主前缀
      router.push(`/${account}${(url.startsWith('/')? url : '/'+url )}`);
    }
    else if(extra?.type == 'from'){ // 跳转并添加来源路径
      router.push(`${url}?from=${encodeURIComponent(fromPath)}`);
    }
    else{ //直接跳转
      router.push(`${url}`);
    }
  }
  // 封装返回方法
  const backAction = ()=>{
    router.back();
  }
  return {jumpAction,backAction} //返回:跳转方法、返回方法
}

// 封装 检测登录状态+返回用户信息
export function useCheckUser(){
  const {jumpAction} = useJumpAction();
  // const checkUser = async (blogger?:string,loginJump?:boolean) => {
  const checkUser = async ({blogger="",loginJump=false}:{blogger?:string,loginJump?:boolean} = {}) => {
    try{
      const account = blogger || window.__NEXT_ACCOUNT__ || localStorage.getItem('account') || ""
      const userInfo = cookieGet('userInfo');
      const lastDomain = cookieGet('lastDomain');
      if(userInfo && (lastDomain == account)){
        // console.log('缓存userInfo',userInfo);
        return {data:userInfo}
      }
      const response = await fetch(`/api/login/check?blogger=${account||''}`);
      const {data,msg,error} = await response.json();
      if (response.ok) { // 已登陆
        if(data?.isLogin){
          if(!lastDomain || lastDomain != account){
            cookieSet('lastDomain', account||'');
          }
          if(data?.userInfo){
            cookieSet("userInfo",data);
          }
          if(data?.userInfo?.user_token){
            cookieSet("token",data?.userInfo?.user_token||"");
          }
          return {data,msg,error};
        }
      }
      if(loginJump){ // 未登录，跳转登录页
        jumpAction('/auth',{type:"from"})
      }
      return Promise.reject({data,msg,error})
    }catch(e){
      return Promise.reject(e)
    }
  }
  return {checkUser}; //返回:检测登录方法
}