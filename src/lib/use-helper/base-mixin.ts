import { useRouter,useParams,usePathname} from "next/navigation"; // 公开路径导入
import { useRef } from "react";
interface ExtraType {
  type?:string
}
export function useJumpAction(){
  const router = useRouter();
  const fromPath = usePathname();
  const jumpAction = (url:string,extra:ExtraType={type:"blog_auto"})=>{
    const account = window.__NEXT_ACCOUNT__||localStorage.getItem('account') || ""
    console.log('jumpAction',url,fromPath,extra,account);
    if(extra?.type == 'blog_auto'){
      router.push(`/blog/${account}/${(url.startsWith('/')?url.slice(1):url)}`);
    }
    else if(extra?.type == 'from'){
      router.push(`${url}?from=${encodeURIComponent(fromPath)}`);
    }
    else{
      router.push(`${url}`);
    }
  }
  const backAction = ()=>{
    router.back();
  }
  return {jumpAction,backAction}
}

export function useCheckUser({loginJump=false}:{loginJump?:boolean} = {}){
  const {jumpAction} = useJumpAction();
  const checkUser = async (blogger?:string) => {
    try{
      const account = window.__NEXT_ACCOUNT__||localStorage.getItem('account') || ""
      const response = await fetch(`/api/login/check?blogger=${blogger||account||''}`);
      const {data,msg,error} = await response.json();
      if (response.ok) {
        if(data?.isLogin){
          return {data,msg,error};
        }
      }
      if(loginJump){
        jumpAction('/blog/auth',{type:"from"})
      }
      return Promise.reject({data,msg,error})
    }catch(e){
      return Promise.reject(e)
    }
  }
  return {checkUser};
}

type UploadType = {
  onChange?: (props:any)=>void,
  onUpload?: (props:any)=>void,
  isUploadAuto?: boolean,
}
export function useUpload(props:UploadType){
  const {onChange = ()=>{},onUpload = ()=>{},isUploadAuto = false} = props;
  const fileInputRef = useRef<HTMLInputElement>(null); // 用于触发文件选择

  // 处理图片上传的核心函数
  const handleUpload = () => {
    // 创建隐藏的文件选择 input（也可预先在 JSX 中定义）
    if (!fileInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*'; // 仅允许图片
      input.onchange = _onFileSelect; // 选择文件后触发上传
      fileInputRef.current = input;
    }
    // 触发文件选择对话框
    fileInputRef.current.click();
  };

  // 选择文件后调用上传 API
  const _onFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    console.log('input',input);
    if (!input.files || input.files.length === 0) return;
    console.log('files',input.files);
    const file = input.files[0];
    console.log('file',file);
    // 1. 校验文件
    // if (!file.type.startsWith('image/')) {
    //   alert('仅支持图片格式');
    //   return;
    // }
    // if (file.size / 1024 / 1024 > 5) { // 假设限制 5MB
    //   alert('图片大小不能超过5MB');
    //   return;
    // }

    // 2. 构造 FormData，调用你的上传 API
    const formData = new FormData();
    formData.append('file', file);
    console.log('formData',formData);
    onChange && onChange(formData)
    if(isUploadAuto){
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) throw new Error('上传失败');
        const result = await response.json();
        console.log('上传成功，返回数据：', result);
        onUpload && onUpload(result);
        // 3. 上传成功后，将图片 URL 插入到 Quill 编辑器
        // const quill = quillInstance.current;
        // if (quill) {
        //   const range = quill.getSelection(); // 获取当前光标位置
        //   if (range) {
        //     quill.insertEmbed(range.index, 'image', result.data.url); // 插入图片
        //     quill.setSelection(range.index + 1); // 光标移到图片后
        //   }
        // }
  
      } catch (error) {
        console.error('图片上传失败：', error);
        // alert('图片上传失败，请重试');
      } finally {
        // 重置 input，允许重复选择同一文件
        input.value = '';
      }
    }
  };
  return {handleUpload};
}


export function useUploadTemp(){
// 存储临时URL与File的映射：{ blobUrl: File }
  const tempFileMap = useRef<Map<string, File>>(new Map());

  // 触发文件选择，返回选中的文件及对应的临时URL
  const selectFiles = () => {
    return new Promise<{ blobUrls: string[]; files: File[] }>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (files.length === 0) return resolve({ blobUrls: [], files: [] });
        const blobUrls: string[] = [];
        files.forEach(file => {
          const blobUrl = URL.createObjectURL(file); // 生成临时URL
          blobUrls.push(blobUrl);
          tempFileMap.current.set(blobUrl, file); // 记录映射
        });
        resolve({ blobUrls, files });
      };
      input.click();
    });
  };

  // 批量上传临时图片（接收临时URL列表，返回 临时URL→实际URL 的映射）
  const uploadTempImages = async (blobUrls: string[]) => {
    if (blobUrls.length === 0) return {};

    // 过滤出仍存在映射的临时URL（避免用户删除后仍上传）
    const validEntries = blobUrls
      .map(blobUrl => ({ blobUrl, file: tempFileMap.current.get(blobUrl) }))
      .filter(({ file }) => !!file);
    console.log('uploadTempImages validEntries',validEntries);
    if (validEntries.length === 0) return {};

    // 批量上传
    const uploadPromises = validEntries.map(async ({ blobUrl, file }) => {
      const formData = new FormData();
      formData.append('file', file!);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`上传失败: ${blobUrl}`);
      const result = await response.json();
      return { blobUrl, realUrl: result.data.url };
    });

    const results = await Promise.all(uploadPromises);
    console.log('uploadTempImages results',results);
    const urlMap: Record<string,string> = {};
    results.forEach(({ blobUrl, realUrl }) => {
      urlMap[blobUrl] = realUrl;
      // 清理映射和临时URL资源
      tempFileMap.current.delete(blobUrl);
      URL.revokeObjectURL(blobUrl);
    });

    return urlMap;
  };

  return { selectFiles, uploadTempImages };
}