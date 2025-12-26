"use client"
import React, { useRef, useState, useEffect } from 'react';
import {article} from '@/supabase/supabase';
import {useJumpAction} from "@/lib/hooks/base-hooks"
import type { TableColumnsType } from 'antd';
import { Table,Switch,Button,Space } from 'antd';
import SearchBox from "@/components/common/search-box/SearchBox";
import AntdSelect from "@/components/common/custom-antd/Select";
import Loading from "@/components/common/loading/loading";

type Props = {
  params: Promise<{ account: string }>; //动态路由 [account] 对应的参数
}
// PAGE ADMIN 文章列表
export default function Articles({params}:Props){
  // const {account} = React.use(params);
  const [articles, setArticles] = useState<article[]>([] as article[])
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(800);
  // const [tableWidth, setTableWidth] = useState(1000);
  const [loading, setLoading] = useState(true)
  const {jumpAction} = useJumpAction();
  const [searchText,setSearchText] = useState<string>("");
  const [selectData, setSelectData] = useState<number>(0);
  const [apiParams, setApiParams] = useState<any>(null);
  const [filterType, setFilterType] = useState<"articles" | undefined>(
    undefined
  );
  const [inited, setInited] = useState(false);
  //console.log('PAGE ADMIN Articles',account,articles,searchText);
  const onChange = (id: number,checked: boolean) => {
    //console.log(`switch to ${checked}`);
    updateInfo(id,checked);
  };
  async function updateInfo(id:number,published:boolean){
    try{
      const res = await fetch(
        `/api/articles/article-publish-edit`,
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
        //console.log('更新成功:', data);
        fetchArticleList();
      }
    }catch(error){
      //console.error('更新状态时出错:', error);
    }
  }
  const columns: TableColumnsType<article> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key:'id',
      align:'center',
      fixed: 'left',
      // width: 100,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key:'title',
      align:'center',
      fixed: 'left',
      // width: 200,
    },
    {
      title: '摘要',
      dataIndex: 'excerpt',
      key:'excerpt',
      align:'center',
      // width: 300,
    },
    {
      title: '发布状态',
      key:'published',
      align:'center',
      // width: 100,
      render:(row: article)=><Switch checkedChildren="开" unCheckedChildren="关" checked={!!row.published} onChange={(checked)=>onChange(row.id,checked)} />
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key:'created_at',
      align:'center',
      // width: 200,
    },
    {
      title: '最后修改时间',
      dataIndex: 'updated_at',
      key:'updated_at',
      align:'center',
      // width: 200,
    },
    {
      title: '操作',
      key: 'action',
      align:'center',
      fixed: 'right',
      // width: 200,
      render: (row: article) => <div className='flex justify-center items-center'><Button style={{marginLeft:0}} size="small" type="primary" onClick={()=>jumpAction(`admin/articles/${row.id}`)}>编辑</Button></div>,
    },
  ];
  //console.log('PAGE ADMIN Articles',account);

  // 监听容器高度变化，更新表格高度
  const updateTableHeight = () => {
    if (tableContainerRef.current) {
      // console.log('tableContainerRef.current.clientHeight',tableContainerRef.current.clientHeight);
      // console.log('tableContainerRef.current.clientWidth',tableContainerRef.current.clientWidth,tableContainerRef.current);
      // setTableWidth((tableContainerRef.current.clientWidth) - 20);
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
      //console.log('cleanup tableContainerRef.current.clientHeight');
      cancelAnimationFrame(timer);
      window.removeEventListener('resize', updateTableHeight);
    };
  }, []);

  useEffect(() => {
    if(inited){
      fetchArticleList();
    }
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
    setApiParams(`?blogger=${window.__NEXT_ACCOUNT__}&search=${searchText}`);
    setFilterType("articles");
    const loadData = async () => {
      await fetchArticleList();
    };
    loadData();
  }, []);
  
  // 获取文章数据并关联作者信息
  const fetchArticleList = async () => {
    try {
      const response = await fetch(`/api/articles/get-article-list?blogger=${window.__NEXT_ACCOUNT__}&search=${searchText}&groupsId=${selectData}`);
      const result = await response.json();
      if (response.ok) {
        setArticles(result.data);
        // setArticles([{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}] as article[]);
      } else {
        setArticles([]);
      }
    } catch (error) {
      setArticles([]);
    } finally {
      setInited(true);
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
              apiName="/api/articles/get-article-groups"
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
      <div className='flex-1 min-h-0' ref={tableContainerRef}>
        <Table<article>
          className="h-full"
          scroll={{y: tableHeight}} //set-layout.tsx不overflow-hidden就不能横向滚动 暂时不改
          // scroll={{x:tableWidth,y: tableHeight}} //set-layout.tsx不overflow-hidden就不能横向滚动 暂时不改
          pagination={{
            pageSize: 15,
            total: articles.length,
          }}
          rowKey="id"
          columns={columns}
          dataSource={articles}
        />
      </div>
    </div>
  )

}