'use client'
import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import {useUploadTemp} from "@/lib/use-helper/base-mixin";
import Quill from 'quill';
import type { Blot } from 'parchment';

import type Toolbar from 'quill/modules/toolbar';
import type { Delta } from 'quill'; // 导入 Delta 类型（需安装 @types/quill）
import 'quill/dist/quill.snow.css';

// 1. 正确断言 Image 类型，包含 Quill 注册所需的静态属性
const Image = Quill.import('formats/image') as {
  new (value: string): Blot; // 构造函数
  sanitize: (url: string) => string; // 自定义的 sanitize 方法
  blotName: string; // 格式名称（必须，如 'image'）
  tagName: string | string[]; // 对应的 HTML 标签（必须，如 'img'）
};

// 2. 重写 sanitize 方法（允许 blob URL）
Image.sanitize = (url: string) => url;

// 3. 注册时指定格式名称（确保与 blotName 一致）
Quill.register({ 'formats/image': Image }, true); // 关键：显式指定注册路径

// 定义组件暴露给父组件的方法类型
interface QuillEditorRef {
  // 获取 Delta 格式内容（推荐）
  getDeltaContent: () => Delta | null;
  // 获取 HTML 格式内容
  getHtmlContent: () => string | null;
  // 获取纯文本内容
  getTextContent: () => string | null;
  
  tempUrlsUpload: () => void;

  // 新增：提取编辑器中所有临时图片URL（blob:xxx）
  getTempImageUrls: () => string[];
  // 替换编辑器中的临时URL为实际URL
  replaceTempUrls: (urlMap: Record<string, string>) => void;
}


type Props = {
  extraClass?:string,
  customStyle?: React.CSSProperties,
  // initialContent?: Delta
  initialContent?: string,
}
type UploadType = {
  onChangeType?: (res: any) => void,
  onUploadType?: (res: any) => void,
  // onChangeType?: (formData: FormData) => void,
}
// export default function QuillImageEditor(props: Props) {
const QuillEditor = forwardRef<QuillEditorRef, Props>(
  ({ extraClass, customStyle, initialContent }, ref) => {
  
    // const {extraClass,customStyle} = props;
  const editorRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)
  // const onChange:UploadType['onChangeType'] = (res:any)=>{
  //   console.log('外层onChange',res);

  // };
  // const onUpload:UploadType['onUploadType'] = (res:any)=>{
  //   console.log('外层onUpload',res);
  //   if (quillRef.current) {
  //     const range = quillRef.current.getSelection(); // 获取当前光标位置
  //     if (range) {
  //       quillRef.current.insertEmbed(range.index, 'image', res.data.url); // 插入图片
  //       quillRef.current.setSelection(range.index + 1); // 光标移到图片后
  //     }
  //   }
  // };
  // const {handleUpload} = useUpload({onChange,onUpload,isUploadAuto:true});
  const {selectFiles,uploadTempImages} = useUploadTemp();
  
  useEffect(() => {
    if (!editorRef.current) return
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike','code','link','blockquote',{ 'header': 1 }, { 'header': 2 },{ 'background': []},{ 'color': []},],
      [{ 'size': []},{ 'align': []},{ 'indent': '-1' }, { 'indent': '+1' },{ 'list': 'ordered' }, { 'list': 'bullet' },'image','video'], 
      // [{ 'font': []}],
      // [{ 'script': 'sub' }, { 'script': 'super' }], 
      [],
    ];

    // 初始化 Quill 编辑器
    quillRef.current = new Quill(editorRef.current, {
      theme: 'snow', // 带工具栏的主题
      modules: {
        toolbar: toolbarOptions,
      },
      placeholder: '请输入内容...'
    })

    // 监听图片上传按钮点击（可选，用于自定义交互）
    // const toolbar = quillRef.current.getModule('toolbar') as Toolbar
    // console.log('toolbar',toolbar);
    // toolbar.addHandler('image', (res)=>{
    //   console.log('image addhandler 测试',res);
    //   handleUpload()
    // });
    const toolbar = quillRef.current.getModule('toolbar') as Toolbar;
    toolbar.addHandler('image', async () => {
      const { blobUrls } = await selectFiles(); // 获取临时URL
      console.log('外面 获取临时URL',blobUrls);
      const quill = quillRef.current;
      if (!quill) return;

      const range = quill.getSelection();
      if (range) {
        // 插入所有选中的图片（临时URL）
        blobUrls.forEach((blobUrl:any) => {
          console.log('blobUrl',blobUrl);
          quill.insertEmbed(range.index, 'image', blobUrl);
        });
        console.log('插入',quillRef.current?.getContents());
        quill.setSelection(range.index + blobUrls.length);
      }
    });
    // 组件卸载时清理
    return () => {
      quillRef.current = null;
    };
  }, [])

  // 提取编辑器中所有临时图片URL（blob:xxx）
  const getTempImageUrls = () => {
    const quill = quillRef.current;
    if (!quill) return [];

    const content = quill.getContents();
    const tempUrls: string[] = [];
    // 遍历Delta内容，收集所有blob:开头的图片URL
    console.log('getTempImageUrls 遍历Delta内容，收集所有blob:开头的图片URL',content.ops);
    content.ops.forEach(op => {
      if (op.insert && typeof op.insert === 'object' && op.insert.image) {
        const url = op.insert.image as string;
        if (url.startsWith('blob:')) { // 仅匹配临时URL
          tempUrls.push(url);
        }
      }
    });
    return tempUrls;
  };

  // 替换编辑器中的临时URL为实际URL
  const replaceTempUrls = (urlMap: Record<string, string>) => {
    const quill = quillRef.current;
    if (!quill) return null;
    console.log('替换编辑器中的临时URL为实际URL',urlMap);
    const content = quill.getContents();
    content.ops.forEach(op => {
      if (op.insert && typeof op.insert === 'object' && op.insert.image) {
        const tempUrl = op.insert.image as string;
        if (urlMap[tempUrl]) { // 替换存在的映射
          op.insert.image = urlMap[tempUrl];
        }
      }
    });

    quill.setContents(content); // 更新内容
    return content;
  };

  const tempUrlsUpload = async (): Promise<Delta | null> => {
    const tempUrls = getTempImageUrls();
    console.log('拿到tempUrls:',tempUrls);
    if (tempUrls.length > 0) {
      const urlMap = await uploadTempImages(tempUrls);
      console.log('拿到urlMap:',urlMap);
      const content = replaceTempUrls(urlMap);
      console.log('拿到content:',content);
      return content; // content 是 Delta 类型
    } else {
      return quillRef.current?.getContents() || null; // 无图片时返回当前内容
    }
  };
  // 向外暴露方法（供父组件调用保存）
  useImperativeHandle(ref, () => ({
    // 获取 Delta 格式内容
    getDeltaContent: () => {
      return quillRef.current?.getContents() || null;
    },
    // 获取 HTML 格式内容
    getHtmlContent: () => {
      return quillRef.current?.root.innerHTML || null;
    },
    // 获取纯文本内容
    getTextContent: () => {
      return quillRef.current?.getText() || null;
    },
    
    getTempImageUrls,
    replaceTempUrls,
    tempUrlsUpload
  }));

  // 初始内容赋值（当 initialContent 存在时）
  useEffect(() => {
    console.log('useEffect initialContent',initialContent);
    if (quillRef.current && initialContent) {
      // 使用 Delta 格式设置内容（推荐）
      quillRef.current.setContents(JSON.parse(initialContent));
    }
  }, [initialContent]); // 监听 initialContent 变化，数据加载后自动赋值


  return (
    <div 
      ref={editorRef} 
      className={extraClass}
      style={customStyle} 
    />
  )
  }
);
export default QuillEditor;