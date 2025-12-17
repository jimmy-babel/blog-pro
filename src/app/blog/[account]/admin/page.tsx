"use client"
import React from 'react';
import { useEffect, useState } from 'react'
import {useCheckUser} from "@/lib/use-helper/base-mixin"
import Loading from "@/components/loading-css/loading";

export default function Articles(){
  const [loading, setLoading] = useState(true)
  console.log('PAGE ADMIN 首页');
  const {checkUser} = useCheckUser({loginJump:true});

  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        const res = await checkUser();
        if(!mounted)return;
        console.log('checkuser then ',res);
      } catch (error) {
        console.error('初始化时出错:', error)
      } finally {
        setLoading(false)
      }
    }
    init();
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <Loading></Loading>
    )
  }
  return (
    <div className="w-full h-full flex justify-center items-center tracking-wide">
      <div className='flex flex-col items-center leading-7'>
        <div>欢迎来到</div>
        <div>【BLOG后台管理】</div>
      </div>
    </div>
  )

}