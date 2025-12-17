"use client";
import React, { useEffect, useState } from "react";
import { life_styles } from "@/lib/supabase";
import Loading from "@/components/loading-css/loading";
import Cascader from "@/components/custom-antd/Cascader";
import List from "@/app/blog/[account]/web/lifestyles/components/list";
type Props = {
  params: Promise<{ account: string }>; //动态路由 [account] 对应的参数
};
const LifeStyles = (props: Props) => {
  const { params } = props;
  const { account } = React.use(params);
  const [lifeStyles, setLifeStyles] = useState<life_styles[]>(
    [] as life_styles[]
  );
  const [loading, setLoading] = useState(true);
  const [apiParams, setApiParams] = useState<any>(null);
  const [setType, setSetType] = useState<"lifestyles" | undefined>(undefined);
  const [selectData, setSelectData] = useState<number[]>([]);
  useEffect(() => {
    let mounted = true;

    // 初始化应用，检查用户状态 -> 获取文章数据
    const init = async () => {
      try {
        setApiParams(`?blogger=${account}`);
        setSetType("lifestyles");
        if (!mounted) return;
        // 然后获取文章数据
        await loadData();
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

  // 获取文章数据并关联作者信息
  const loadData = async () => {
    try {
      console.log("api: get-lifestyles-list");
      const response = await fetch(
        `/api/blog/get-lifestyles-list?blogger=${account}&labelId=${selectData.join(',')}`
      );
      const result = await response.json();
      console.log("api: /blog/get-lifestyles-list then", result, response);
      if (response.ok) {
        setLifeStyles(result.data);
      } else {
        console.error("获取文章时出错:", result.error);
        setLifeStyles([]);
      }
    } catch (error) {
      console.error("获取文章时出错:", error);
      setLifeStyles([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, [selectData]);

  const onScrollEnd = () => {
    console.log("onScrollEnd");
  };

  if (loading) {
    return <Loading></Loading>;
  }
  return (
    <div className="container w-[60%] m-auto">
      <div className="flex items-center min-h-[50px] sticky top-[var(--nav-bar-height)] z-[1] backdrop-filter backdrop-blur-[10px]">
        <div className="font-bold text-3xl mr-4">手记列表</div>
        <div className="w-35">
          <Cascader 
            isApiAuto
            changeOnSelect
            setType={setType}
            apiName="/api/common/get-lifestyles-label"
            apiMethods="GET"
            expandTrigger="hover"
            apiParams={apiParams}
            selectData={selectData}
            setSelectData={setSelectData}
          ></Cascader>
        </div>
      </div>

      <List
        listData={lifeStyles}
        onScrollEnd={onScrollEnd}
      ></List>
    </div>
  );
};

export default LifeStyles;
