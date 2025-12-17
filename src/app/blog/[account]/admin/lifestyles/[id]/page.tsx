"use client";
import { useRef, useState, useEffect } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { Button,UploadFile } from "antd";
import { useJumpAction,useCheckUser } from "@/lib/use-helper/base-mixin";
import { life_styles } from "@/lib/supabase";
import ImageUploader from "@/components/ImageUploader";
import Cascader from "@/components/custom-antd/Cascader"
import Loading from "@/components/loading-css/loading";

interface listItem {
  uid: string;
  name: string;
  url?: string;
}
type Props = {
  params: Promise<{ account: string; id: string }>; //动态路由 [account] 对应的参数
};
interface ImageUploaderRef {
  uploadPendingFiles: () => Promise<Array<UploadFile>>;
}
export default function LifeStylesEdit({ params }: Props) {
  const { account, id } = React.use(params);
  const { jumpAction,backAction } = useJumpAction();
  const { checkUser } = useCheckUser({ loginJump: true });
  const [lifestyles, setLifeStyles] = useState<life_styles>({} as life_styles);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [defaultFileList, setDefaultFileList] = useState<listItem[]>([]);
  const [defaultPhotosList, setDefaultPhotosList] = useState<listItem[]>([]);
  const [apiParams, setApiParams] = useState<any>(null);
  const [setType, setSetType] = useState<"lifestyles" | undefined>(
    undefined
  );
  const [selectData, setSelectData] = useState<number[]>([]);
  const uploadCoverRef = useRef<ImageUploaderRef>(null);
  const uploadPhotosRef = useRef<ImageUploaderRef>(null);

  console.log("PAGE ADMIN LifeStylesEdit", lifestyles);

   useEffect(() => {
      let mounted = true
      const init = async () => {
        try {
          const res = await checkUser();
          if(!mounted)return;
          setUserInfo(res.data?.userInfo);
          console.log('checkuser then',res);
        } catch (error) {
          console.error('初始化时出错:', error)
        }
      }
      init();
      return () => {
        console.log('销毁');
        mounted = false
      }
    }, [])
  
    useEffect(()=>{
      if(!userInfo)return
      setApiParams(`?userId=${userInfo?.id}`);
      setSetType("lifestyles");
      const loadData = async ()=>{
        await getDetail();
      };
      loadData();
    },[userInfo])

  // 加载手记
  const getDetail = async () => {
    try {
      if (id == "0") return;
      console.log("api: get-lifestyles-detail");
      const response = await fetch(
        `/api/admin/get-lifestyles-detail?blogger=${account}&userId=${userInfo?.id}&id=${Number(id)}`
      );
      const result = await response.json();
      console.log("api: /blog/get-lifestyles-detail then", result);
      if (response.ok) {
        let data = result.data;
        if (data) {
          data.cover_img && setDefaultFileList([
            { uid: data.id, url: data.cover_img, name: `name-${data.id}` },
          ]);
          data.photos?.length>0 && setDefaultPhotosList(data.photos?.map((item:any)=>({uid: `${item.id}`, url: item.url, name: `name-${item.id}`}))||[]);
          data.labelIds?.length > 0 && setSelectData(data.labelIds);
          setLifeStyles(data);
        }
      } else {
        console.error("获取手记时出错:", result.error);
      }
    } catch (error) {
      console.error("获取手记时出错:", error);
    } finally {
      console.log('finally');
      setLoading(false);
    }
  };

  // 提交手记
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uploadCover = await uploadCoverRef.current?.uploadPendingFiles();
    const uploadPhotos = await uploadPhotosRef.current?.uploadPendingFiles();
    console.log("uploadCover", uploadCover);
    console.log("uploadPhotos", uploadPhotos);
    if (!userInfo?.id) return;
    setMessage("");
    try {
      let { title = "", excerpt = "", published = false } = lifestyles;
      let params = {
        id: Number(id),
        title,
        excerpt: excerpt || "",
        published,
        user_id: userInfo?.id,
        cover_img: uploadCover?.[0]?.url || lifestyles.cover_img || "",
        photos: uploadPhotos || [],
        labelIds: selectData || [],
      };
      console.log("api: admin/lifestyles-edit", params);
      const response = await fetch(`/api/admin/lifestyles-edit`, {
        body: JSON.stringify(params),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { data, msg, error } = await response.json();
      console.log("api: admin/lifestyles-edit then", data, msg, error);
      setMessage(msg);
      if (data > 0) {
        setTimeout(() => {
          jumpAction("admin/lifestyles");
        }, 500);
      }
    } catch (error) {
      setMessage(`发布失败: ${error}`);
    }
  };

  if(loading){
    return (
      <Loading></Loading>
    )
  }

  return (
    <div className="bg-gray-50 h-full overflow-y-scroll">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {id === "0" ? "添加" : "编辑"}手记
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 标题 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                手记标题
              </label>
              <input
                type="text"
                id="title"
                value={lifestyles.title || ""}
                onChange={(e) =>
                  setLifeStyles((item) => ({
                    ...item,
                    title: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入手记标题"
              />
            </div>

            {/* 摘要 */}
            <div>
              <label
                htmlFor="excerpt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                手记摘要 (可选)
              </label>
              <textarea
                id="excerpt"
                value={lifestyles.excerpt || ""}
                onChange={(e) =>
                  setLifeStyles((item) => ({
                    ...item,
                    excerpt: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入手记摘要"
              />
            </div>
            {/* 分组 */}
            <div>
              <label
                htmlFor="groups"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                手记分组
              </label>
              <div className="w-35">
                <Cascader 
                  isApiAuto
                  expandTrigger="hover"
                  setType={setType}
                  apiName="/api/common/get-lifestyles-label"
                  apiMethods="GET"
                  apiParams={apiParams}
                  selectData={selectData}
                  setSelectData={setSelectData}
                ></Cascader>
              </div>
            </div>
            {/* 封面 */}
            <div>
              <label
                htmlFor="cover_img"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                手记封面
              </label>
              <ImageUploader
                uploadBtnText="上传封面"
                defaultFileList={defaultFileList}
                ref={uploadCoverRef}
              ></ImageUploader>
            </div>
            {/* 正文 */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                手记相册
              </label>
              <ImageUploader
                multiple
                maxCount={50}
                defaultFileList={defaultPhotosList}
                ref={uploadPhotosRef}
              ></ImageUploader>
            </div>

            {/* 发布选项 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={lifestyles.published}
                onChange={(e) =>
                  setLifeStyles((item) => ({
                    ...item,
                    published: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="published"
                className="ml-2 block text-sm text-gray-700"
              >
                立即发布（取消勾选将保存为草稿）
              </label>
            </div>

            {/* 消息提示 */}
            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.includes("成功")
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            {/* 按钮组 */}
            <div className="flex justify-end">
              <Button
                size="middle"
                onClick={() => backAction()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "发布中..."
                  : lifestyles.published
                  ? "发布手记"
                  : "保存草稿"}
              </Button>
            </div>
          </form>
        </div>

        {/* 提示 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">提示</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• 手记按照标题、摘要、封面作在博客端列表中展示</p>
            {/* <p>• 如果不填写摘要，系统会自动截取正文前 200 个字符作为摘要</p> */}
            <p>• 未发布的手记将保存为草稿，则不会公布到博客端</p>
            {/* <p>• 手记标题会自动生成 URL 友好的链接地址</p> */}
          </div>
        </div>
      </main>
    </div>
  );
}
