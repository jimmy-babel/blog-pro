'use client'
import React from 'react'
// import Tiptap from '@/components/Tiptap'
// import Quill from '@/components/Quill'
import dynamic from 'next/dynamic';

type Props = {}

export default function Page(props: Props) {
  const QuillImageEditor = dynamic(
    () => import('@/components/Quill'), // 替换为你的组件实际路径
    { ssr: false } // 禁用服务器端渲染，避免访问 document
  );
  return (
    <>
      <div className='pt-20'>测试</div>
      <div className='w-[50%]'>
        <QuillImageEditor></QuillImageEditor>
      </div>
      {/* <Tiptap></Tiptap> */}
    </>
  )
}