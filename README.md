# Supabase 博客系统

这是一个基于 Next.js 和 Supabase 构建的现代博客系统，支持用户注册、文章发布、评论等功能。

## 技术栈

- **前端**: Next.js 14, TypeScript, Tailwind CSS
- **后端**: Supabase (PostgreSQL + API + Auth)
- **部署**: Vercel (推荐)

## 功能特性

- ✅ 用户注册/登录 (Supabase Auth)
- ✅ 文章发布和编辑
- ✅ 文章列表和详情页
- ✅ 评论系统
- ✅ 响应式设计
- ✅ Markdown 支持
- ✅ 文章搜索 (基于 slug)

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd blog
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置环境变量

创建 `.env.local` 文件并添加以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**注意**: 请将 `your_supabase_project_url` 和 `your_supabase_anon_key` 替换为你的实际 Supabase 项目信息。

### 4. 设置 Supabase 数据库

在 Supabase 控制台中执行以下 SQL 语句来创建必要的数据表：

```sql
-- 创建文章表
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  slug TEXT UNIQUE NOT NULL,
  published BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户配置表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建评论表
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX posts_user_id_idx ON posts(user_id);
CREATE INDEX posts_published_idx ON posts(published);
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX comments_post_id_idx ON comments(post_id);
CREATE INDEX comments_user_id_idx ON comments(user_id);
```

### 5. 设置行级安全 (RLS)

为了确保数据安全，请在 Supabase 控制台中启用并配置行级安全策略：

```sql
-- 启用 RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Posts 表策略
CREATE POLICY "公开文章可以被所有人查看" ON posts
  FOR SELECT USING (published = true);

CREATE POLICY "用户可以查看自己的文章" ON posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建文章" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的文章" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的文章" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Profiles 表策略
CREATE POLICY "用户配置可以被所有人查看" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "用户可以更新自己的配置" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Comments 表策略
CREATE POLICY "评论可以被所有人查看" ON comments
  FOR SELECT USING (true);

CREATE POLICY "登录用户可以创建评论" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的评论" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的评论" ON comments
  FOR DELETE USING (auth.uid() = user_id);
```

### 6. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 项目结构

```
blog/
├── src/
│   ├── app/
│   │   ├── auth/           # 登录/注册页面
│   │   ├── post/[slug]/    # 文章详情页
│   │   ├── write/          # 写文章页面
│   │   ├── page.tsx        # 首页
│   │   └── layout.tsx      # 全局布局
│   └── lib/
│       └── supabase.ts     # Supabase 客户端配置
├── public/                 # 静态资源
├── tailwind.config.js      # Tailwind CSS 配置
└── README.md
```

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 设置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署

### 其他平台

项目可以部署到任何支持 Next.js 的平台，如 Netlify、Railway 等。

## 使用说明

### 发布文章

1. 访问 `/auth` 页面注册或登录
2. 登录后点击"写文章"按钮
3. 填写标题、摘要（可选）和内容
4. 勾选"立即发布"或保存为草稿
5. 点击"发布文章"

### 评论功能

1. 在文章详情页可以查看评论
2. 登录用户可以发表评论
3. 评论按时间顺序显示

### Markdown 支持

文章内容支持基本的 Markdown 格式：

- **粗体文本**
- *斜体文本*
- `代码`
- 换行

## 自定义

### 修改样式

项目使用 Tailwind CSS，你可以在组件中修改 className 来自定义样式。

### 添加新功能

1. 在 Supabase 中创建新的数据表
2. 更新 TypeScript 类型定义 (`src/lib/supabase.ts`)
3. 创建新的页面组件
4. 添加相应的 API 调用

## 常见问题

### 1. 数据库连接失败

请检查 `.env.local` 文件中的 Supabase URL 和 API Key 是否正确。

### 2. 用户注册后无法登录

确保在 Supabase 控制台中启用了邮箱验证，或者在开发环境中关闭邮箱验证。

### 3. 文章无法显示

检查文章是否已发布 (`published = true`)，只有已发布的文章才会在首页显示。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
