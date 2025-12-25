import type { ImageLoaderProps } from 'next/image';

const NormalLoader = ({ src, width, quality }: ImageLoaderProps) => {
  // NormalLoader 处理普通图片的loader
  const params = [
    `w_${width}`,
    `q_${quality || 80}`,
    'f_auto',
    'c_scale',
  ];
  return `${src}?${params.join(',')}`;
};

const CloudinaryLoader = ({ src, width, quality }: ImageLoaderProps) => {
  // CloudinaryLoader 处理Cloudinary图片的loader
  
  // 如果是本地预览URL，直接返回
  if (src.startsWith("blob:") || src.startsWith("data:")) {
    return src;
  }
  // 提取Cloudinary图片的public_id
  const publicId = src.split("/").pop();
  // 拼接Cloudinary变换参数
  const transformations = ["f_auto", `w_${width}`, `q_${quality || 85}`].join(",");
  // 生成最终URL
  return `https://res.cloudinary.com/dhfjn2vxf/image/upload/${transformations}/${publicId}`;
};

export const ImageLoader = {
  normal:NormalLoader,
  cloudinary: CloudinaryLoader,
}