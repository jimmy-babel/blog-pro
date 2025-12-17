"use client"
import React, { useRef, useState, useEffect } from 'react';
import {article} from '@/lib/supabase';
import {useJumpAction,useCheckUser} from "@/lib/use-helper/base-mixin"
import type { TableColumnsType, TableProps } from 'antd';
import Image from 'next/image';
import { Table,Switch,Button,Space } from 'antd';
import SearchBox from "@/components/SearchBox";
import AntdSelect from "@/components/custom-antd/Select";
import Loading from "@/components/loading-css/loading";

type Props = {
  params: Promise<{ account: string }>; //动态路由 [account] 对应的参数
}
export default function Articles({params}:Props){
  const {account} = React.use(params);
  const [articles, setArticles] = useState<article[]>([] as article[])
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(400);
  const [loading, setLoading] = useState(true)
  const {jumpAction} = useJumpAction();
  const {checkUser} = useCheckUser({loginJump:true});
  const [userInfo, setUserInfo] = useState<any>(null);
  const [searchText,setSearchText] = useState<string>("");
  const [selectData, setSelectData] = useState<number>(0);
  const [apiParams, setApiParams] = useState<any>(null);
  const [filterType, setFilterType] = useState<"articles" | undefined>(
    undefined
  );
  console.log('PAGE ADMIN Articles',account,articles,searchText);
  const onChange = (id: number,checked: boolean) => {
    console.log(`switch to ${checked}`);
    updateInfo(id,checked);
  };
  
  // 自定义Cloudinary Loader
  const cloudinaryLoader = ({ src="", width=110, quality=100 }:{src:string,width:number,quality?:number}) => {
    
    // 提取Cloudinary图片的public_id（即路径中最后的文件名部分）
    const publicId = src.split('/').pop();
    // 拼接Cloudinary支持的变换参数（路径格式）
    const transformations = ['f_auto', `w_${width}`, `q_${quality}`].join(',');
    // 生成最终URL
    return `https://res.cloudinary.com/dhfjn2vxf/image/upload/${transformations}/${publicId}`;
  };

  async function updateInfo(id:number,published:boolean){
    try{
      const res = await fetch(
        `/api/admin/article-publish-edit`,
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
        fetchArticleList();
      }
    }catch(error){
      console.error('更新状态时出错:', error);
    }
  }
  const columns: TableColumnsType<article> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key:'id',
      align:'center'
    },
    // {
    //   title: '封面',
    //   key: 'id',
    //   render: (row: article) => <div><Image loader={cloudinaryLoader} src={row.cover_img||''} alt="COVER" width={110} height={110} className='object-contain'/></div>,
    // },
    {
      title: '标题',
      dataIndex: 'title',
      key:'title',
      align:'center'
    },
    {
      title: '摘要',
      dataIndex: 'excerpt',
      key:'excerpt',
      align:'center'
    },
    {
      title: '发布状态',
      key:'published',
      align:'center',
      render:(row: article)=><Switch checkedChildren="开" unCheckedChildren="关" checked={!!row.published} onChange={(checked)=>onChange(row.id,checked)} />
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key:'created_at',
      align:'center'
    },
    {
      title: '最后修改时间',
      dataIndex: 'updated_at',
      key:'updated_at',
      align:'center'
    },
    {
      title: '操作',
      key: 'action',
      align:'center',
      render: (row: article) => <div className='flex justify-center items-center'><Button style={{marginLeft:0}} size="small" type="primary" onClick={()=>jumpAction(`admin/articles/${row.id}`)}>编辑</Button></div>,
    },
  ];
  console.log('PAGE ADMIN Articles',account);

  // 监听容器高度变化，更新表格高度
  const updateTableHeight = () => {
    if (tableContainerRef.current) {
      // 设置表格高度为容器高度减去一些边距
      setTableHeight((tableContainerRef.current.clientHeight) - 64 - 55);
    }
  };

  // 组件挂载后和窗口大小变化时更新高度
  useEffect(() => {
    // 使用requestAnimationFrame确保DOM已经渲染完成
    const timer = requestAnimationFrame(() => {
      updateTableHeight();
    });
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateTableHeight);
    
    // 清理函数
    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener('resize', updateTableHeight);
    };
  }, []);

  useEffect(() => {
    fetchArticleList();
  }, [selectData]);
  // 数据加载完成后更新高度
  useEffect(() => {
    if (!loading && articles.length > 0) {
      // 使用setTimeout确保Table组件已经完全渲染
      const timer = setTimeout(() => {
        updateTableHeight();
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [loading, articles]);

  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        const res = await checkUser();
        if(!mounted)return;
        console.log('checkuser then2',res);
        setUserInfo(res?.data?.userInfo);
        // setApiParams(`?userId=${res?.data?.id}&search=`);
        // setFilterType("articles");
        // await fetchArticleList()
      } catch (error) {
        console.error('初始化时出错:', error)
        setLoading(false)
      }
    }
    init();
    return () => {
      mounted = false
    }
  }, [])
  
  useEffect(() => {
    if (!userInfo) return;
    setApiParams(`?userId=${userInfo?.id}&search=${searchText}`);
    setFilterType("articles");
    const loadData = async () => {
      await fetchArticleList();
    };
    loadData();
  }, [userInfo]);
  
  // 获取文章数据并关联作者信息
  const fetchArticleList = async () => {
    if(!userInfo?.id) return;
    try {
      console.log('api: get-article-list',searchText);
      // let groupsId = selectData?.join(',') || "";
      const response = await fetch(`/api/admin/get-article-list?userId=${userInfo?.id}&search=${searchText}&groupsId=${selectData}`);
      const result = await response.json();
      console.log('api: /blog/get-article-list then',result,response);
      if (response.ok) {
        setArticles(result.data);
      } else {
        console.error('获取文章时出错:', result.error);
        setArticles([]);
      }
    } catch (error) {
      console.error('获取文章时出错:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  if(loading){
    return (
      <Loading></Loading>
    )
  }
  return (
    <div className="list-box flex flex-col w-full h-full min-h-0 overflow-hidden">
      <div className='header-box flex justify-between items-center p-3'>
        <div className='search-box flex'>
          <Space>
            <SearchBox searchText={searchText} setSearchText={setSearchText} onSearch={fetchArticleList} />
            <AntdSelect
              extraClass="min-w-27"
              filterType={filterType}
              isRowSetAllAuto
              isApiAuto
              apiName="/api/admin/get-article-groups"
              apiMethods="GET"
              apiParams={apiParams}
              selectData={selectData}
              setSelectData={(data: number | number[]) => setSelectData(data as number)}
            ></AntdSelect>
          </Space>
        </div>
        <div className='btn-box'>
          <Button type='primary' onClick={()=>jumpAction(`admin/articles/0`)}>添加文章</Button>
        </div>
      </div>
      <div className='flex-1 overflow-hidden min-h-0' ref={tableContainerRef}>
        <Table<article>
          className="h-full"
          scroll={{y: tableHeight}}
          rowKey="id"
          // rowSelection={{ 
          //   type: 'checkbox', 
          //   getCheckboxProps: (row: article) => ({
          //     name: row.title,
          //   }),
          // }}
          columns={columns}
          dataSource={articles}
        />
      </div>
    </div>
  )

}