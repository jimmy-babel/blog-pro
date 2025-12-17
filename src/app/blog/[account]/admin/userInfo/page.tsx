"use client";
import React, { useEffect, useState } from "react";
import { Card, Button } from "antd";

type Props = {};
type Blogger = {
  user_name?: string;
  introduce1?: string;
  introduce2?: string;
  motto1?: string;
  motto2?: string;
}
const UserInfo = (props: Props) => {
  const [bloggerInfo, setBloggerInfo] = useState<Blogger>({});
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("提交表单数据:", bloggerInfo);
    updateInfo();
  };
  useEffect(() => {
    getDetail();
  }, []);
  async function getDetail(){
    try{
      const res = await fetch(
        `/api/common/get-blogger-info?blogger=${window.__NEXT_ACCOUNT__}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      console.log('获取博主信息:', data);
      setBloggerInfo((data?.data || {}) as Blogger);
    }catch(error){
      console.error('获取博主信息时出错:', error);
    }
  }
  async function updateInfo(){
    try{
      const res = await fetch(
        `/api/admin/blogger-info-edit`,
        {
          method: "POST",
          body: JSON.stringify({
            ...bloggerInfo,
            blogger: window.__NEXT_ACCOUNT__ || "",
          }),
        }
      );
      const data = await res.json();
      console.log('更新成功:', data);
    }catch(error){
      console.error('更新博主信息时出错:', error);
    }
  }
  return (
    <div className="user-info-box">
      <form onSubmit={handleSubmit} className="p-10">
        <div className="gap-y-8 flex flex-col">
          <Card
            className="w-full rounded-[12px] overflow-hidden shadow-gray-400"
            variant="borderless"
            hoverable
          >
            <div className="p-8">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  你的名字
                </label>
                <input
                  type="text"
                  id="title"
                  value={bloggerInfo.user_name || ""}
                  onChange={(e) =>
                    setBloggerInfo((item) => ({
                      ...item,
                      user_name: e.target.value || "",
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入名字"
                />
              </div>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2 mt-5"
                >
                  Introduce1
                </label>
                <input
                  type="text"
                  id="title"
                  value={bloggerInfo.introduce1 || ""}
                  onChange={(e) =>
                    setBloggerInfo((item) => ({
                      ...item,
                      introduce1: e.target.value || "",
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入内容"
                />
              </div>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2 mt-5"
                >
                  Introduce2
                </label>
                <input
                  type="text"
                  id="title"
                  value={bloggerInfo.introduce2 || ""}
                  onChange={(e) =>
                    setBloggerInfo((item) => ({
                      ...item,
                      introduce2: e.target.value || "",
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入内容"
                />
              </div>
            </div>
          </Card>
          
          <Card
            className="w-full rounded-[12px] overflow-hidden shadow-gray-400"
            variant="borderless"
            hoverable
          >
            <div className="p-8">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Motto1
                </label>
                <input
                  type="text"
                  id="title"
                  value={bloggerInfo.motto1 || ""}
                  onChange={(e) =>
                    setBloggerInfo((item) => ({
                      ...item,
                      motto1: e.target.value || "",
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入内容"
                />
              </div>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2 mt-5"
                >
                  Motto2
                </label>
                <input
                  type="text"
                  id="title"
                  value={bloggerInfo.motto2 || ""}
                  onChange={(e) =>
                    setBloggerInfo((item) => ({
                      ...item,
                      motto2: e.target.value || "",
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入内容"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              type="primary"
              htmlType="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserInfo;
