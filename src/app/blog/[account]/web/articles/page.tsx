"use client";
import React from "react";
import { useEffect, useState } from "react";
import List from "@/app/blog/[account]/web/articles/components/list";
import { article } from "@/lib/supabase";
import Loading from "@/components/loading-css/loading";
import AntdSelect from "@/components/custom-antd/Select";

type Props = {
  params: Promise<{ account: string }>; //动态路由 [account] 对应的参数
};
export default function Articles({ params }: Props) {
  const { account } = React.use(params);
  const [articles, setArticles] = useState<article[]>([] as article[]);
  const [selectData, setSelectData] = useState<number>(0);
  const [apiParams, setApiParams] = useState<any>(null);
  const [filterType, setFilterType] = useState<"articles" | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);
  console.log("PAGE BLOG Articles", account);

  useEffect(() => {
    let mounted = true;

    // 初始化应用，检查用户状态 -> 获取文章数据
    const init = async () => {
      try {
        setApiParams(`?blogger=${account}`);
        setFilterType("articles");
        // 先检查用户状态
        if (!mounted) return;
        // 然后获取文章数据
        await fetchArticleList();
      } catch (error) {
        console.error("初始化应用时出错:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    console.log('selectData onchange',selectData);
    if (!isNaN(selectData)) {
      fetchArticleList();
    }
  }, [selectData]);

  // 获取文章数据并关联作者信息
  const fetchArticleList = async () => {
    try {
      console.log("api: get-article-list");
      // let groupsId = selectData?.join(',') || "";
      const response = await fetch(
        `/api/blog/get-article-list?blogger=${account}&groupsId=${selectData}`
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
  const onScrollEnd = () => {
    console.log('onScrollEnd');
  }
  if (loading) {
    return <Loading></Loading>;
  }
  return (
    <div className="list-box w-[60%] m-auto">
      {/* <div className="flex items-center min-h-[50px] sticky top-[var(--nav-bar-height)] z-[1] backdrop-filter backdrop-blur-[4px]"> */}
      <div className="flex items-center min-h-[50px] sticky top-[var(--nav-bar-height)] z-[1]">
        <div className="font-bold text-3xl">文章列表</div>
        <div className="pl-4">
          <AntdSelect
            extraClass="min-w-27"
            filterType={filterType}
            isRowSetAllAuto
            isApiAuto
            apiName="/api/common/get-article-groups"
            apiMethods="GET"
            apiParams={apiParams}
            selectData={selectData}
            setSelectData={(data: number | number[]) => setSelectData(data as number)}
          ></AntdSelect>
        </div>
      </div>
      <div className="pl-1">
        <List listData={articles} onScrollEnd={onScrollEnd}></List>
      </div>
    </div>
  );
}
