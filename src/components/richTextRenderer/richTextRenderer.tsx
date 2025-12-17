// 博客端展示组件（可作为服务器组件或客户端组件，Next.js 中推荐服务器组件）
import DOMPurify from 'dompurify';
// 引入 Quill 核心样式（仅保留展示所需，无需工具栏样式）
import 'quill/dist/quill.snow.css';

// 组件 props：接收保存的 HTML 内容
type Props = {
  htmlContent: string; // 从后端获取的 Quill 保存的 HTML 内容
  customStyle?: React.CSSProperties; // 自定义展示样式（如宽度、间距）
};

export default function RichTextRenderer({ htmlContent, customStyle }: Props) {
  // 1. 净化 HTML（核心：过滤恶意脚本、危险属性）
  const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
    // 配置允许的标签（按需调整，仅保留博客展示需要的标签）
    ALLOWED_TAGS: [
      'p', 'h1', 'h2', 'h3', 'strong', 'em', 'u', 'strike', 'code', 'pre',
      'blockquote', 'ul', 'ol', 'li', 'img', 'video', 'a', 'span', 'br',
      'div', 'iframe' // 若有视频/iframe 需求可添加
    ],
    // 配置允许的属性（避免危险属性如 onclick、href=javascript:）
    ALLOWED_ATTR: [
      'src', 'alt', 'href', 'title', 'class', 'style', 'width', 'height',
      'frameborder', 'allowfullscreen' // 视频/iframe 相关属性
    ],
    // 禁止 href 跳转恶意协议（如 javascript:）
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });

  return (
    <div
      // 用 dangerouslySetInnerHTML 渲染 HTML 内容
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      style={{
        // maxWidth: '800px', // 博客内容常见宽度限制
        // margin: '0 auto', // 居中展示
        // padding: '20px 0',
        lineHeight: '1.8', // 优化阅读体验
        ...customStyle, // 支持自定义样式覆盖
      }}
      // 可选：为链接添加新窗口打开、noopener 安全属性
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'A') {
          target.setAttribute('target', '_blank');
          target.setAttribute('rel', 'noopener noreferrer');
        }
      }}
    />
  );
}