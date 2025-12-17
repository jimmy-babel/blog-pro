// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream'; // 引入 Node.js 流工具

// 初始化 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 工具函数：将流转换为 Promise，获取上传结果
const uploadStreamToCloudinary = (stream: Readable, options: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => { // 回调函数获取结果
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.pipe(uploadStream); // 将文件流导入 Cloudinary 上传流
  });
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: '未获取到文件' }, { status: 400 });
    }

    // 1. 判断文件类型，选择预设
    let preset: string;
    let resourceType: 'image' | 'video';

    if (file.type.startsWith('image/')) {
      preset = 'blog_image_preset';
      resourceType = 'image';
    } else if (file.type.startsWith('video/')) {
      preset = 'blog_video_preset';
      resourceType = 'video';
    } else {
      return NextResponse.json({ error: '仅支持图片和视频格式' }, { status: 400 });
    }

    // 2. 将 File 转换为 Node.js 可读流（适配 Cloudinary 流上传）
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer); // 将 Buffer 转为可读流

    // 3. 上传到 Cloudinary（使用 Promise 包装，获取结果）
    const uploadResult = await uploadStreamToCloudinary(stream, {
      resource_type: resourceType,
      preset: preset,
    });
    console.log('服务器上传',uploadResult);
    // 4. 返回结果（此时 uploadResult 包含 secure_url）
    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        type: resourceType
      },
    });

    // return NextResponse.json({
    //   success: true,
    //   data: {
    //     url: "https://res.cloudinary.com/dhfjn2vxf/image/upload/v1762765166/fgojzasyb6t91ktm5in9.png",
    //     type: "image"
    //   },
    // });

  } catch (error) {
    console.error('上传失败：', error);
    return NextResponse.json({ error: '服务器上传失败' }, { status: 500 });
  }
}