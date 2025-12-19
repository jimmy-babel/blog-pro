"use client";
import React from "react";
import { useEffect, useState, useRef } from "react";
import { life_styles } from "@/lib/supabase";
import { useJumpAction, useCheckUser } from "@/lib/use-helper/base-mixin";
import type { TableColumnsType, TableProps } from "antd";
import Image from "next/image";
import { Table, Switch, Button, Space } from "antd";
import SearchBox from "@/components/SearchBox";
import Loading from "@/components/loading-css/loading";
import Cascader from "@/components/custom-antd/Cascader";

type Props = {
  params: Promise<{ account: string }>; //动态路由 [account] 对应的参数
};
export default function LifeStyles({ params }: Props) {
  const { account } = React.use(params);
  const [lifestyles, setLifestyles] = useState<life_styles[]>(
    [] as life_styles[]
  );
  const [loading, setLoading] = useState(true);
  const { jumpAction } = useJumpAction();
  const { checkUser } = useCheckUser({ loginJump: true });
  const [searchText, setSearchText] = useState<string>("");
  const [apiParams, setApiParams] = useState<any>(null);
  const [setType, setSetType] = useState<"lifestyles" | undefined>(undefined);
  const [selectData, setSelectData] = useState<number[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(400);

  console.log("PAGE ADMIN LifeStyles", account, lifestyles, searchText);
  const onChange = (id:number,checked: boolean) => {
    console.log(`switch to ${checked}`);
    updateInfo(id,checked);
  };
  // 自定义Cloudinary Loader
  const cloudinaryLoader = ({
    src = "",
    width = 110,
    quality = 100,
  }: {
    src: string;
    width: number;
    quality?: number;
  }) => {
    // 提取Cloudinary图片的public_id（即路径中最后的文件名部分）
    const publicId = src.split("/").pop();
    // 拼接Cloudinary支持的变换参数（路径格式）
    const transformations = ["f_auto", `w_${width}`, `q_${quality}`].join(",");
    // 生成最终URL
    return `https://res.cloudinary.com/dhfjn2vxf/image/upload/${transformations}/${publicId}`;
  };
  
  async function updateInfo(id:number,published:boolean){
    try{
      const res = await fetch(
        `/api/admin/lifestyles-publish-edit`,
        {
          method: "POST",
          body: JSON.stringify({
            id,
            published,
          }),
        }
      );
      const data = await res.json();
      if(data?.data){
        console.log('更新成功:', data);
        fetchlifeStylesList();
      }
    }catch(error){
      console.error('更新状态时出错:', error);
    }
  }

  const columns: TableColumnsType<life_styles> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "封面",
      key: "id",
      render: (row: life_styles) => (
        <div>
          <Image
            loader={cloudinaryLoader}
            src={row.cover_img || ""}
            alt="COVER"
            width={110}
            height={110}
            className="object-contain"
          />
        </div>
      ),
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      align: "center",
    },
    {
      title: "摘要",
      dataIndex: "excerpt",
      key: "excerpt",
      align: "center",
    },
    {
      title: "发布状态",
      key: "published",
      align: "center",
      render: (row: life_styles) => (
        <Switch
          checkedChildren="开"
          unCheckedChildren="关"
          checked={!!row.published}
          onChange={(checked)=>onChange(row.id,checked)}
        />
      ),
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
    },
    {
      title: "最后修改时间",
      dataIndex: "updated_at",
      key: "updated_at",
      align: "center",
    },
    {
      title: "操作",
      key: "action",
      align: "center",
      render: (row: life_styles) => (
        <div className="flex justify-center items-center">
          <Button
            style={{ marginLeft: 0 }}
            size="small"
            type="primary"
            onClick={() => jumpAction(`admin/lifestyles/${row.id}`)}
          >
            编辑
          </Button>
        </div>
      ),
    },
  ];
  console.log("PAGE ADMIN lifestyles", account);

  // 查询登录状态+拿生活手记列表数据
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const res = await checkUser();
        if (!mounted) return;
        setUserInfo(res.data?.userInfo);
      } catch (error) {
        console.error("初始化时出错:", error);
      }
    };
    init();
    return () => {
      console.log("销毁");
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!userInfo) return;
    setApiParams(`?userId=${userInfo?.id}&search=${searchText}`);
    setSetType("lifestyles");
    const loadData = async () => {
      await fetchlifeStylesList();
    };
    loadData();
  }, [userInfo]);

  // 监听容器高度变化，更新表格高度
  const updateTableHeight = () => {
    if (tableContainerRef.current) {
      // 设置表格高度为容器高度减去一些边距
      setTableHeight(tableContainerRef.current.clientHeight - 64 - 55);
    }
  };

  // 组件挂载后和窗口大小变化时更新高度
  useEffect(() => {
    // 使用requestAnimationFrame确保DOM已经渲染完成
    const timer = requestAnimationFrame(() => {
      updateTableHeight();
    });

    // 监听窗口大小变化
    window.addEventListener("resize", updateTableHeight);

    // 清理函数
    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener("resize", updateTableHeight);
    };
  }, []);

  // 数据加载完成后更新高度
  useEffect(() => {
    if (!loading && lifestyles.length > 0) {
      // 使用setTimeout确保Table组件已经完全渲染
      const timer = setTimeout(() => {
        updateTableHeight();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [loading, lifestyles]);

  // 获取生活手记数据并关联作者信息
  const fetchlifeStylesList = async () => {
    if(!userInfo?.id) return;
    try {
      console.log("api: get-life_styles-list", searchText, userInfo.id);
      const response = await fetch(
        `/api/admin/get-lifestyles-list?blogger=${account}&userId=${
          userInfo.id
        }&search=${searchText}&labelId=${selectData.join(",")}`
      );

      const result = await response.json();
      console.log("api: /blog/get-lifestyles-list then", result, response);
      if (response.ok) {
        setLifestyles(result.data);
      } else {
        console.error("获取生活手记时出错:", result.error);
        setLifestyles([]);
      }
    } catch (error) {
      console.error("获取生活手记时出错:", error);
      setLifestyles([]);
    } finally {
      console.log("finally");
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchlifeStylesList();
  }, [selectData]);
  if (loading) {
    return <Loading></Loading>;
  }

  return (
    <div className="list-box flex flex-col w-full h-full min-h-0 overflow-hidden">
      <div className="header-box flex justify-between items-center p-3">
        <div className="search-box flex">
          <Space>
            <SearchBox
              searchText={searchText}
              setSearchText={setSearchText}
              onSearch={fetchlifeStylesList}
            />
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
          </Space>
        </div>
        <div className="btn-box">
          <Button
            type="primary"
            onClick={() => jumpAction(`admin/lifestyles/0`)}
          >
            添加生活手记
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden min-h-0" ref={tableContainerRef}>
        <Table<life_styles>
          className="h-full"
          scroll={{ y: tableHeight }}
          rowKey="id"
          // rowSelection={{
          //   type: 'checkbox',
          //   getCheckboxProps: (row: life_styles) => ({
          //     name: row.title,
          //   }),
          // }}
          columns={columns}
          dataSource={lifestyles}
        />
      </div>
    </div>
  );
}
