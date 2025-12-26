import type { ImageLoaderProps } from 'next/image';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
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
  // 1. 处理本地预览URL（blob/data协议），直接返回
  if (src.startsWith('blob:') || src.startsWith('data:')) {
    return src;
  }
  // 2. 提取public_id：兼容两种src格式
  let publicId: string;
  if (src.startsWith(CLOUDINARY_BASE_URL)) {
    // 情况1：src是完整的Cloudinary URL（如你的原始URL）
    // 截取 "image/upload/" 之后的部分（即public_id）
    const uploadPathIndex = src.indexOf(`${CLOUDINARY_BASE_URL}/`) + CLOUDINARY_BASE_URL.length + 1;
    publicId = src.slice(uploadPathIndex);
  } else {
    // 情况2：src直接传入public_id（如 "v1766737862/mrbcfc0x1besvww4g5g7.jpg"）
    publicId = src;
  }

  // 3. 参数校验：避免无效值
  const safeWidth = Math.max(1, width || 800); // 宽度至少1px，默认800px
  const safeQuality = Math.max(1, Math.min(100, quality || 85)); // 质量限制在1-100之间

  // 4. 拼接Cloudinary变换参数（补充c_limit防止图片拉伸，更通用）
  const transformations = [
    'f_auto', // 自动选择最优格式（webp/jpeg等）
    'c_limit', // 限制缩放，保持宽高比
    `w_${safeWidth}`, // 按宽度缩放
    `q_${safeQuality}`, // 质量
  ].join(',');

  // 5. 生成最终URL
  return `${CLOUDINARY_BASE_URL}/${transformations}/${publicId}`;
};

export const ImageLoader = {
  normal:NormalLoader,
  cloudinary: CloudinaryLoader,
}