'use client';
import React from 'react'
import Avatar from "@/components/common/custom-antd/Avatar";
import { BloggerInfo } from "@/types";
type Props = {
  bloggerInfo: BloggerInfo; 
}
const Banner = (props: Props) => {
  const { bloggerInfo } = props;
  return (
    <>
      <div className='flex min-h-[60vh] w-full'>
        <div className='flex-1 flex-col flex justify-center h-[inherit] anim-op-y text-center'>
          <div className='text-5xl'>{(bloggerInfo?.user_name||"")+"'s Blog"}</div>
          <div className='text-2xl pl-6 pt-5 italic'>{bloggerInfo?.motto1 || ""}</div>
          <div className='pl-6 pt-3 text-gray-400 italic'>{bloggerInfo?.motto2 || ""}</div>
        </div>
        <div className='flex-1 anim-op-y h-[inherit] flex-col flex justify-center pl-10'>
          <div className='anim-hover-scale-sm w-full'>
            <div className={`w-full max-w-[500px]`}>
              <div className='h-[230px] rounded-xl overflow-hidden box-shadow p-8'>
                <div className='flex'>
                  <Avatar size={120} shape="square" src={bloggerInfo?.avatar_url || "/avatar.png"}></Avatar>
                  <div className='pl-4'>
                    <div className='text-2xl bold pt-1 pb-2'>{bloggerInfo?.user_name || ""}</div>
                    <span className='pb-2'>{bloggerInfo?.introduce1 || ""}</span>
                  </div>
                </div>
                {bloggerInfo?.introduce2? <div className='text-[18px] text-gray-500 pt-5'>🔥{bloggerInfo?.introduce2 || ""}</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className='min-h-[200px]'></div> */}
    </>
  )
}
export default Banner;