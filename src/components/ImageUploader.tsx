'use client';
import { Upload, Button, message, Image, GetProp, UploadFile, UploadProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';

type Props = {
  defaultFileList?: Array<UploadFile>;
  // onFinish?: (value: Array<UploadFile>) => void;
  multiple?: boolean; // 新增：是否允许多选，默认false（单选）
  maxCount?: number; // 新增：最大文件数量限制，默认无限制
  uploadBtnText?:string
};

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

interface ImageUploaderRef {
  uploadPendingFiles: () => Promise<Array<UploadFile>>;
  // getFileList: () => Array<UploadFile>;
  // clearFiles: () => void; // 新增：清空文件列表方法
}

const ImageUploader = forwardRef<ImageUploaderRef, Props>(
  ({ 
    defaultFileList = [], 
    // onFinish = () => {}, 
    multiple = false, 
    maxCount = 1,
    uploadBtnText = "上传图片"
  }, ref) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const pendingFilesRef = useRef<Map<string, File>>(new Map());

    // 初始化默认文件列表
    useEffect(() => {
      const initializedFiles = defaultFileList.map(item => ({
        uid: `${item.uid || Date.now()}`,
        name: item.name || '未知文件',
        url: item.url,
        status: 'done' as const,
        percent: 100,
      }));
      console.log('initializedFiles', initializedFiles);
      setFileList(initializedFiles);
      // // onFinish && onFinish(initializedFiles);
      // }, [defaultFileList, onFinish]);
    }, [defaultFileList]);

    // 检查是否达到最大文件数量
    const isMaxReached = () => {
      if (maxCount === undefined) return false;
      return fileList.length >= maxCount;
    };

    // 处理文件选择（支持单选/多选）
    // const beforeUpload = (file: File) => {
    //   console.log('进来 beforeUpload',file);
    //   // 校验文件类型
    //   // const isImage = file.type.startsWith('image/');
    //   // if (!isImage) {
    //   //   message.error('请上传图片格式文件（JPG/PNG等）');
    //   //   return false;
    //   // }

    //   // 校验文件大小
    //   // const isLt3MB = file.size / 1024 / 1024 < 3;
    //   // if (!isLt3MB) {
    //   //   message.error('图片大小不能超过3MB');
    //   //   return false;
    //   // }

    //   // 单选模式：清空现有文件
    //   if (!multiple && fileList.length > 0) {
    //     setFileList([]);
    //     pendingFilesRef.current.clear();
    //   }

    //   // 检查最大数量限制
    //   if (isMaxReached()) {
    //     message.error(`最多只能上传${maxCount}个文件`);
    //     return false;
    //   }

    //   // 生成唯一标识和临时预览URL
    //   const uid = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    //   const previewUrl = URL.createObjectURL(file);
    //   const newFile = {
    //     uid,
    //     name: file.name,
    //     status: 'uploading' as const,
    //     percent: 0,
    //     preview: previewUrl,
    //     // originFileObj: file,
    //   };
    //   // 添加到文件列表
    //   // setFileList(n=>[...n,newFile]);
    //   // 暂存原始文件
    //   pendingFilesRef.current.set(uid, file);
    //   return false;
    // };

    // // 处理文件状态变化（删除/新增）
    // const handleChange: UploadProps['onChange'] = ({ file, fileList }) => {
    //   console.log('进来 handleChange', file, fileList);
    //   // 处理删除
    //   if (file.status === 'removed') {
    //     pendingFilesRef.current.delete(file.uid);
    //     // 单选模式下删除后显示上传按钮
    //     if (!multiple && fileList.length === 0) {
    //       setFileList([]);
    //     }
        
    //   } else if (file.status === 'done') {
    //     // 上传成功
    //     // message.success(`文件 ${file.name} 上传成功`);

    //   }
    //   else if (file.status === 'error') {
    //     message.error(`文件 ${file.name} 上传失败`);
    //   }
    //   // onFinish(trimData(fileList));
    //   setFileList(fileList);
    //   console.log('pendingFilesRef',pendingFilesRef);
    // };

    // 新逻辑
    const validateFile = (file: File | undefined): boolean => {
      // const isImage = file.type.startsWith('image/');
      // if (!isImage) {
      //   message.error('请上传图片格式文件（JPG/PNG等）');
      //   return false;
      // }

      // const isLt3MB = file.size / 1024 / 1024 < 3;
      // if (!isLt3MB) {
      //   message.error('图片大小不能超过3MB');
      //   return false;
      // }

      // 检查最大数量限制
      if (maxCount !== undefined && fileList.length >= maxCount) {
        message.error(`最多只能上传${maxCount}个文件`);
        return false;
      }

      return true;
    };

    // 2. 移除 beforeUpload，仅保留 onChange 处理所有逻辑
    const handleChange: UploadProps['onChange'] = ({ file, fileList }) => {
      const curFile = fileList.find(item => item.uid === file.uid);
      const originFile = curFile?.originFileObj as File | undefined;
      console.log('进来 handleChange',file.status,originFile,file,fileList);
      if (file.status === 'removed') {
        pendingFilesRef.current.delete(file.uid);
        setFileList(fileList);
        console.log('进来1',fileList);
      }else{
        if(!originFile){
          console.log('进来2',fileList);
          return;
        }
        else if (!validateFile(originFile)) {
          // 从 fileList 中移除校验失败的文件
          const filteredList = fileList.filter(f => f.uid !== file.uid);
          console.log('进来3',filteredList);
          setFileList(filteredList);
          // onFinish(trimData(filteredList));
          return;
        }else{
          pendingFilesRef.current.set(file.uid, originFile);
          const previewUrl = URL.createObjectURL(originFile);
          // 更新文件列表（添加预览 URL 等信息）
          // const updatedList = fileList.find(item => item.uid === file.uid)||{};
          setFileList(n=>n.concat([{uid:file.uid,url:previewUrl,name:file.name,percent:0,preview: previewUrl, status: 'done'}]));
          // setFileList(n=>n.filter(i=>i.uid!==file.uid).concat([{...updatedList as any,percent:0,preview: previewUrl, status: 'done'},]));
          // setFileList(n=>n.map(item=>{
          //   console.log('进来咯',item.uid,file.uid,item);
          //   return (item.uid === file.uid ? {...item,percent:0,preview: previewUrl, status: 'done'} : item);
          // }));
        }
        console.log('进来5', fileList,pendingFilesRef.current);
      }

      // 场景1：文件刚被添加（status 为 'uploading' 且未被上传过）
      // if (file.status === 'uploading' || (!file.url && !file.response)) {
      //   // 获取原始 File 对象（AntD 会将其存在 originFileObj 中）
      //   const originFile = file.originFileObj as File | undefined;
      //   if (!originFile) return;

      //   // 校验文件，不通过则过滤
      //   if (!validateFile(originFile)) {
      //     // 从 fileList 中移除校验失败的文件
      //     const filteredList = fileList.filter(f => f.uid !== file.uid);
      //     setFileList(filteredList);
      //     // onFinish(trimData(filteredList));
      //     return;
      //   }

      //   // 单选模式：清空现有文件
      //   if (!multiple && fileList.length > 1) {
      //     const newList = fileList.filter(f => f.uid === file.uid);
      //     setFileList(newList);
      //     // 同步清空暂存的文件
      //     pendingFilesRef.current.clear();
      //   }

      //   // 生成唯一 uid（如果 AntD 未生成，可手动生成）
      //   const uid = file.uid || `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      //   // 生成本地预览 URL
      //   const previewUrl = URL.createObjectURL(originFile);

      //   // 更新文件列表（添加预览 URL 等信息）
      //   const updatedList = fileList.map(f => 
      //     f.uid === file.uid 
      //       ? { ...f, preview: previewUrl, status: 'uploading' as const } 
      //       : f
      //   );
      //   setFileList(updatedList);

      //   // 暂存原始文件到 ref
      //   pendingFilesRef.current.set(uid, originFile);
      // }

      // // 场景2：文件被删除
      // if (file.status === 'removed') {
      //   pendingFilesRef.current.delete(file.uid);
      //   // 单选模式下删除后清空列表
      //   if (!multiple && fileList.length === 0) {
      //     setFileList([]);
      //   }
      // }

      // 同步回调父组件
      // onFinish(trimData(fileList));
    };

    // 预览图片
    const handlePreview = async (file: UploadFile) => {
      if (!file.url && !file.preview && file.originFileObj) {
        file.preview = await getBase64(file.originFileObj as FileType);
      }
      setPreviewImage(file.url || (file.preview as string));
      setPreviewOpen(true);
    };

    // 生成base64预览
    const getBase64 = (file: FileType): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

    // 批量上传暂存文件
    const uploadPendingFiles = async (): Promise<Array<UploadFile>> => {
      const pendingFiles = Array.from(pendingFilesRef.current.entries());
      if (pendingFiles.length === 0) {
        console.log('看看1',pendingFilesRef.current);
        return fileList;
      }

      // 批量上传
      const uploadPromises = pendingFiles.map(async ([uid, file]) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error(`文件 ${file.name} 上传失败`);
        const result = await response.json();
        
        return {
          uid,
          name: file.name,
          url: result.data.url,
          status: 'done' as const,
          percent: 100,
        };
      });

      try {
        const uploadedFiles = await Promise.all(uploadPromises);
        
        console.log('看看2',uploadedFiles);
        const updatedFileList = fileList.map(file => {
          const uploaded = uploadedFiles.find(f => f.uid === file.uid);
          return uploaded || file;
        });
        console.log('看看3',updatedFileList);
        setFileList(updatedFileList);
        pendingFilesRef.current.clear();
        // onFinish(updatedFileList);
        // message.success(`成功上传 ${uploadedFiles.length} 个文件`);
        return updatedFileList;
      } catch (error) {
        console.error('上传失败：', error);
        message.error('文件上传失败，请重试');
        throw error;
      }
    };

    // // 清空文件列表
    // const clearFiles = () => {
    //   setFileList([]);
    //   pendingFilesRef.current.clear();
    // };

    // 整理文件列表数据
    // const trimData = (list: UploadFile[]): Array<UploadFile> => {
    //   return list.map(file => ({
    //     uid: file.uid,
    //     url: file.url || (file.preview as string) || '',
    //     name: file.name || '',
    //     status: file.status,
    //     percent: file.percent,
    //   }));
    // };

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      uploadPendingFiles,
      // getFileList: () => trimData(fileList),
      // clearFiles,
    }));

    // 上传按钮显示逻辑：单选且有文件时隐藏，多选/未达上限时显示
    const showUploadBtn = !isMaxReached() && (multiple || fileList.length === 0);

    const UploadBtn = (
      <div>
        <PlusOutlined />
        <div className="pt-2">{uploadBtnText}</div>
      </div>
    );

    return (
      <>
        <Upload
          beforeUpload={()=>false}
          onChange={handleChange}
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          showUploadList={{ showRemoveIcon: true, showPreviewIcon: true }}
          multiple={multiple} // 绑定多选属性
          // disabled={isMaxReached()} // 达到上限时禁用上传
        >
          {showUploadBtn ? UploadBtn : null}
        </Upload>

        {/* 预览图片 */}
        {previewImage && (
          <Image
            wrapperStyle={{ display: 'none' }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage(''),
            }}
            src={previewImage}
          />
        )}
      </>
    );
  }
);

export default ImageUploader;