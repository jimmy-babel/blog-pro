"use client";
import React from "react";
import { useEffect, useState } from "react";
import { supabase, article } from "@/lib/supabase";
import Banner from "@/components/branner/banner";
import Loading from "@/components/loading-css/loading";
import MoodRecord from "@/components/mood-record/MoodRecord";
type Props = {
  params: Promise<{ account: string }>; //动态路由 [account] 对应的参数
};
// 首页
export default function Blog({ params }: Props) {
  const { account } = React.use(params);
  const [articles, setArticles] = useState<article[]>([] as article[]);
  const [loading, setLoading] = useState(true);
  console.log("PAGE Blog 首页", articles, loading);

  useEffect(() => {
    let mounted = true;
    // 初始化应用，检查用户状态 -> 获取文章数据
    const init = async () => {
      try {
        if (!mounted) return;
        await fetchArticleList();
      } catch (error) {
        console.error("初始化应用时出错:", error);
      } finally {
        setLoading(false);
      }
    };

    // 设置超时保护，10秒后强制停止加载状态
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.log("加载超时，强制停止加载状态");
        setLoading(false);
      }
    }, 10000);

    init().finally(() => {
      clearTimeout(timeoutId);
    });

    // 监听认证状态变化
    // const {
    //   data: { subscription },
    // } = supabase.auth.onAuthStateChange(async (event, session) => {
    //   console.log(
    //     "supabase.auth.onAuthStateChange 监听认证状态变化",
    //     event,
    //     session
    //   );
    //   if (!mounted) return;

    //   if (event === "SIGNED_IN" && session) {
    //   } else if (event === "SIGNED_OUT") {
    //     setUserProfile(null);
    //   }
    // });

    return () => {
      mounted = false;
      // subscription.unsubscribe();
    };
  }, []);

  // const handleSignOut = async () => {
  //   console.log('handleSignOut');
  //   console.log('supabase.auth.signOut');
  //   const { error } = await supabase.auth.signOut()
  //   console.log('supabase.auth.signOut then',error);
  //   if (!error) {
  //     setUserProfile(null)
  //     // 可选：显示退出成功消息
  //   }
  // }

  // 获取文章数据列表数据
  const fetchArticleList = async () => {
    try {
      console.log("api: get-article-list");
      const response = await fetch(
        `/api/blog/get-article-list?blogger=${account}`
      );
      const result = await response.json();
      console.log("api: /blog/get-article-list then", result, response);
      if (response.ok) {
        setArticles(result.data);
      } else {
        console.error("获取文章时出错:", result.error);
        setArticles([]);
      }
    } catch (error) {
      console.error("获取文章时出错:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading></Loading>;
  }

  return (
    <div className="content-box">
      <div className="flex justify-between flex-wrap pl-20 pr-20">
        <Banner></Banner>
        <MoodRecord></MoodRecord>
      </div>
    </div>
  );
}
