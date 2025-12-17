"use client"
import React from 'react';
import { useEffect, useState } from 'react'
import {article,Blogger} from '@/lib/supabase';
import {UserOutlined,CalendarOutlined,EyeOutlined} from '@ant-design/icons';
import RichTextRenderer from "@/components/richTextRenderer/richTextRenderer";
import Loading from "@/components/loading-css/loading";
import "./page.css";
type Props = {
  params: Promise<{ account: string,id:Number }>; //动态路由 [account] 对应的参数
}
export default function Article({params}:Props){
  
  const { account,id } = React.use(params);
  const [article, setArticle] = useState<article>({} as article)
  const [userInfo, setUserInfo] = useState<Blogger>({} as Blogger)
  const [loading, setLoading] = useState(true)

  console.log('PAGE BLOG Article DETAIL',account);
  
  useEffect(() => {
    let mounted = true

    // 初始化应用，检查用户状态 -> 获取文章数据
    const init = async () => {
      console.log('init');
      try {
        if (!mounted)return
        // 然后获取文章数据
        await fetchArticleDetail()
      } catch (error) {
        console.error('初始化应用时出错:', error)
      } finally {
        setLoading(false)
      }
    }
    init();
    return () => {
      mounted = false
    }
  }, [])
  
  // 获取文章数据并关联作者信息
  const fetchArticleDetail = async () => {
    try {
      console.log('api: get-article-detail');
      const response = await fetch(`/api/blog/get-article-detail?blogger=${account}&id=${Number(id)}`);
      const result = await response.json();
      console.log('api: /blog/get-article-detail then',result,response);
      if (response.ok) {
        setArticle(result.data);
        setUserInfo(result.bloggerInfo);
      } else {
        console.error('获取文章时出错:', result.error);
        setArticle([] as any);
      }
    } catch (error) {
      console.error('获取文章时出错:', error);
      setArticle([] as any);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loading></Loading>
    )
  }
  return (
    <div className="article-detial-container pt-10 w-full">
      <div className='container flex w-full max-w-[1100px] m-auto'>
        <div className='article-container flex-1'>
          <div className='title-box w-full'>
            <div className='title text-3xl font-bold text-center'>{article.title}</div>
            <div className='blogger-msg-box text-gray-400 gap-4 flex justify-center items-center'>
              <div className='flex items-center gap-2 leading-15 pb-5'>
                <UserOutlined />
                <div>{userInfo.user_name}</div>
              </div>
              <div className='flex items-center gap-2 leading-15 pb-5'>
                <CalendarOutlined />
                <div>{article.created_at}</div>
              </div>
              <div className='flex items-center gap-2 leading-15 pb-5'>
                <EyeOutlined />
                <div>{'1'} views</div>
              </div>
              {article.labels?.map((item) => (
                <div className='flex items-center gap-2 leading-15 pb-5' key={item.id}>
                  <div className=''>#{item.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div className='content-box w-full pl-12 pr-12' style={{whiteSpace: 'pre-wrap' }}>
            <RichTextRenderer htmlContent={article?.articles_content?.content||""}></RichTextRenderer>
          </div>
        </div>
      </div>
    </div>
  )

}