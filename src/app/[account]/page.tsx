import React from "react";
import Banner from "@/components/home/Banner";
import MoodRecord from "@/components/home/MoodRecord";
import { ResData, BloggerInfo } from "@/types";
import { getBloggerInfo } from "@/apis/common/blogger-info";
type Props = {
  params: Promise<{ account: string }>; //动态路由 [account] 对应的参数
};

// 博客首页
export default async function Home({ params }: Props) {
  const { account } = await params;
  const res: ResData<BloggerInfo> = await getBloggerInfo(account);
  const bloggerInfo = res.data || {};
  //console.log("PAGE--Home", account, bloggerInfo);
  return (
    <div className="content-box">
      <div className="flex justify-between flex-wrap pl-20 pr-20">
        <Banner bloggerInfo={bloggerInfo}></Banner>
        <MoodRecord></MoodRecord>
      </div>
    </div>
  );
}
