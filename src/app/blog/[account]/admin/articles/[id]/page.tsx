"use client";
import { useRef, useState, useEffect } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { Button,UploadFile } from "antd";
import { useJumpAction, useCheckUser } from "@/lib/use-helper/base-mixin";
import { article } from "@/lib/supabase";
import ImageUploader from "@/components/ImageUploader";
import AntdSelect from "@/components/custom-antd/Select";
import Loading from "@/components/loading-css/loading";
import type { Delta } from "quill";
interface ImageUploaderRef {
  uploadPendingFiles: () => Promise<Array<UploadFile>>;
}
interface QuillEditorRef {
  // 获取 Delta 格式内容（推荐）
  getDeltaContent: () => Delta | null;
  // 获取 HTML 格式内容
  getHtmlContent: () => string | null;
  // 获取纯文本内容
  getTextContent: () => string | null;

  tempUrlsUpload: () => any;
}
interface listItem {
  uid: string;
  name: string;
  url?: string;
}
type Props = {
  params: Promise<{ account: string; id: string }>; //动态路由 [account] 对应的参数
};
export default function ArticleEdit({ params }: Props) {
  const { account, id } = React.use(params);
  const { jumpAction } = useJumpAction();
  const { checkUser } = useCheckUser({ loginJump: true });
  const [article, setArticle] = useState<article>({} as article);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const editorRef = useRef<QuillEditorRef>(null);
  const [defaultFileList, setDefaultFileList] = useState<listItem[]>([]);
  const [QuillEditor, setQuillEditor] =
    useState<React.ComponentType<any> | null>(null);
  const [apiParams, setApiParams] = useState<any>(null);
  const [filterType, setFilterType] = useState<"articles" | undefined>(
    undefined
  );
  const [selectData, setSelectData] = useState<number[]>([]);
  const uploadCoverRef = useRef<ImageUploaderRef>(null);

  console.log("PAGE ADMIN ArticleDetail", article);

  const loadQuillEditor = async () => {
    const module = await import("@/components/Quill");
    setQuillEditor(module.default); // 假设组件默认导出
  };

  // 初始化
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        loadQuillEditor();
        const res = await checkUser();
        if (!mounted) return;
        setUserInfo(res?.data?.userInfo);
      } catch (error) {
        console.error("初始化时出错:", error);
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
    if (!userInfo) return;
    setApiParams(`?userId=${userInfo?.id}&search=`);
    setFilterType("articles");
    const init = async () => {
      await loadData();
    };
    init();
  }, [userInfo]);

  // 加载文章
  const loadData = async () => {
    try {
      if (id == "0") return;
      console.log("api: get-article-detail");
      const response = await fetch(
        `/api/admin/get-article-detail?userId=${userInfo?.id}&id=${Number(id)}`
      );
      const result = await response.json();
      console.log("api: /blog/get-article-detail then", result);
      if (response.ok) {
        let data = result.data;
        if (data) {
          data.cover_img && setDefaultFileList([
            { uid: data.id, url: data.cover_img, name: `name-${data.id}` },
          ]);
          setSelectData(data.groupsId?.length > 0 ? data.groupsId : [0]);
          setArticle(data);
        }
      } else {
        console.error("获取文章时出错:", result.error);
      }
    } catch (error) {
      console.error("获取文章时出错:", error);
    }
  };

  // 提交文章
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await editorRef.current?.tempUrlsUpload();
    const deltaContent = editorRef.current?.getDeltaContent();
    const htmlContent = editorRef.current?.getHtmlContent();
    // const uploadCover = await uploadCoverRef.current?.uploadPendingFiles();
    // console.log("uploadCover", uploadCover);
    console.log("deltaContent", deltaContent);
    console.log("handleSubmit", htmlContent);
    if (!userInfo?.id) return;
    setMessage("");
    try {
      let { title = "", excerpt = "", published = false } = article;
      let params = {
        id: Number(id),
        title,
        excerpt: excerpt || "",
        published,
        content: htmlContent || "",
        delta_data: (deltaContent && JSON.stringify(deltaContent)) || "",
        user_id: userInfo?.id,
        cover_img: "",
        // cover_img: uploadCover?.[0]?.url || article.cover_img || "",
        groupsId: selectData || [],
      };
      console.log("api: admin/article-edit", params);
      const response = await fetch(`/api/admin/article-edit`, {
        body: JSON.stringify(params),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { data, msg, error } = await response.json();
      console.log("api: admin/article-edit then", data, msg, error);
      setMessage(msg);
      if (data > 0) {
        setTimeout(() => {
          jumpAction("admin/articles");
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
            {id === "0" ? "添加" : "编辑"}文章
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 标题 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                文章标题
              </label>
              <input
                type="text"
                id="title"
                value={article.title || ""}
                onChange={(e) =>
                  setArticle((item) => ({
                    ...item,
                    title: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入文章标题"
              />
            </div>

            {/* 摘要 */}
            <div>
              <label
                htmlFor="excerpt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                文章摘要 (可选)
              </label>
              <textarea
                id="excerpt"
                value={article.excerpt || ""}
                onChange={(e) =>
                  setArticle((item) => ({
                    ...item,
                    excerpt: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入文章摘要，如果留空将自动从正文生成"
              />
            </div>
            {/* 分组 */}
            <div>
              <label
                htmlFor="groups"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                文章分组
              </label>
              <AntdSelect
                extraClass="min-w-30 max-w-[50%]"
                filterType={filterType}
                isRowSetAllAuto
                isApiAuto
                mode="multiple"
                apiName="/api/admin/get-article-groups"
                apiMethods="GET"
                apiParams={apiParams}
                selectData={selectData}
                setSelectData={(data: number | number[]) => setSelectData(data as number[])}
              ></AntdSelect>
            </div>
            {/* 封面 */}
            {/* <div>
              <label
                htmlFor="cover_img"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                文章封面
              </label>
              <ImageUploader
                uploadBtnText="上传封面"
                defaultFileList={defaultFileList}
                ref={uploadCoverRef}
              ></ImageUploader>
            </div> */}
            {/* 正文 */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                文章内容
              </label>
              {QuillEditor ? (
                <QuillEditor
                  ref={editorRef}
                  initialContent={article?.articles_content?.delta_data || ""}
                ></QuillEditor>
              ) : null}
            </div>

            {/* 发布选项 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={article.published}
                onChange={(e) =>
                  setArticle((item) => ({
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
                onClick={() => router.back()}
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
                  : article.published
                  ? "发布文章"
                  : "保存草稿"}
              </Button>
            </div>
          </form>
        </div>

        {/* 写作提示 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">写作提示</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• 文章按照富文本编辑器的内容展示</p>
            {/* <p>• 如果不填写摘要，系统会自动截取正文前 200 个字符作为摘要</p> */}
            <p>• 未发布的文章将保存为草稿，则不会公布到博客端</p>
            {/* <p>• 文章标题会自动生成 URL 友好的链接地址</p> */}
          </div>
        </div>
      </main>
    </div>
  );
}
