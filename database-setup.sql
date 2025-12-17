-- 创建用户表
CREATE TABLE users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- 强制自增，不允许手动插入id
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_token TEXT UNIQUE,
  user_name TEXT UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai'),
  updated_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai')
);

-- 创建博主表
CREATE TABLE bloggers (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- 强制自增，不允许手动插入id
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT UNIQUE,
  avatar_url TEXT DEFAULT '',
  user_name TEXT DEFAULT '',
  introduce1 TEXT DEFAULT '',
  introduce2 TEXT DEFAULT '',
  motto1 TEXT DEFAULT '',
  motto2 TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai'),
  updated_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai')
);


-- -- 创建评论表
-- CREATE TABLE comments (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
--   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--   content TEXT NOT NULL,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

--文章表
CREATE TABLE articles (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- 强制自增，不允许手动插入id
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  delta_data TEXT NOT NULL DEFAULT '',
  published BOOLEAN DEFAULT false,
  sort INT default 0,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  blogger_id INT REFERENCES bloggers(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai'),
  updated_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai')
);

--文章内容表
CREATE TABLE articles_content (
  id INT generated always as identity primary key,ETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  delta_data TEXT NOT NULL DEFAULT '',
  
  created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai'),
  updated_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai')
)

--文章分组表
CREATE TABLE article_groups (
  id SERIAL PRIMARY KEY,        -- 分组ID（自增主键）
  name TEXT NOT NULL UNIQUE,    -- 分组名称（唯一，不可重复）
  description TEXT DEFAULT ''   -- 分组描述（可选，默认空字符串）
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  blogger_id INT REFERENCES bloggers(id) ON DELETE CASCADE,
);

--文章分组关系表
CREATE TABLE article_groups_relation (
  article_id INT REFERENCES articles(id) ON DELETE CASCADE,  -- 关联文章ID，删除文章时自动删除关联
  group_id INT REFERENCES article_groups(id) ON DELETE CASCADE,      -- 关联分组ID，删除分组时自动删除关联
  PRIMARY KEY (article_id, group_id)  -- 联合主键，避免同一文章重复关联同一分组
);

--生活手记表
CREATE TABLE life_styles (
  id INT generated always as identity primary key,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  sort INT default 0,
  cover_img TEXT NOT NULL DEFAULT '',
  published boolean default false,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  blogger_id INT REFERENCES bloggers(id) ON DELETE CASCADE,

  created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai'),
  updated_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai')
)

--生活手记图片表
CREATE TABLE life_styles_photos (
  id INT generated always as identity primary key,
  url TEXT NOT NULL,
  life_styles_id INT references life_styles(id) ON DELETE CASCADE,
  excerpt TEXT NOT NULL DEFAULT '',
  sort INT default 0,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  blogger_id INT REFERENCES bloggers(id) ON DELETE CASCADE,

  created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai')
)

--生活手记<标签>表
CREATE TABLE life_styles_label (
  id INT generated always as identity primary key,
  name TEXT NOT NULL,
  sort INT default 0,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  blogger_id INT REFERENCES bloggers(id) ON DELETE CASCADE,
)

--生活手记<子标签>表
CREATE TABLE life_styles_sub_label (
  id INT generated always as identity primary key,
  name TEXT NOT NULL,
  sort INT default 0,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
  blogger_id INT REFERENCES bloggers(id) ON DELETE CASCADE,
)

--生活手记<标签与子标签>的关系表
CREATE TABLE life_styles_label_relation (
  label_id INT REFERENCES life_styles_label(id) ON DELETE CASCADE,
  sub_label_id INT REFERENCES life_styles_sub_label(id) ON DELETE CASCADE,
  PRIMARY KEY (label_id, sub_label_id)
)

--(<生活手记与标签>的关联表)
CREATE TABLE life_styles_to_label (
  life_styles_id INT REFERENCES life_styles(id) ON DELETE CASCADE, -- 关联生活手记ID（删手记时自动删关联）
  label_id INT REFERENCES life_styles_label(id) ON DELETE CASCADE, -- 关联标签ID（删标签时自动删关联）
  PRIMARY KEY (life_styles_id, label_id) -- 联合主键：确保同一手记不会重复关联同一标签
);
-- 加索引：优化“通过手记ID查标签”或“通过标签ID查手记”的查询性能
CREATE INDEX idx_life_styles_to_label_life_styles_id ON life_styles_to_label(life_styles_id);
CREATE INDEX idx_life_styles_to_label_label_id ON life_styles_to_label(label_id);


--(<生活手记与子标签>的关联表)
CREATE TABLE life_styles_to_sub_label (
  life_styles_id INT REFERENCES life_styles(id) ON DELETE CASCADE, -- 关联生活手记ID
  sub_label_id INT REFERENCES life_styles_sub_label(id) ON DELETE CASCADE, -- 关联子标签ID
  PRIMARY KEY (life_styles_id, sub_label_id) -- 联合主键：避免重复关联
);
-- 加索引：优化查询性能
CREATE INDEX idx_life_styles_to_sub_label_life_styles_id ON life_styles_to_sub_label(life_styles_id);
CREATE INDEX idx_life_styles_to_sub_label_sub_label_id ON life_styles_to_sub_label(sub_label_id);

--心情记录表
CREATE TABLE mood_records (
  id INT generated always as identity primary key,
  date DATE NOT NULL; 
  emoji TEXT NOT NULL DEFAULT '',
  emoji_key TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  blogger_id INT REFERENCES bloggers(id) ON DELETE CASCADE,

  created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai'),
  updated_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai')
)


-- -- ===============================================
-- -- Supabase 博客系统数据库设置脚本
-- -- ===============================================
-- -- 请在 Supabase 控制台的 SQL 编辑器中执行此脚本

-- -- 1. 创建文章表
-- -- ===============================================
-- CREATE TABLE posts (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   title TEXT NOT NULL,
--   content TEXT NOT NULL,
--   excerpt TEXT,
--   slug TEXT UNIQUE NOT NULL,
--   published BOOLEAN DEFAULT false,
--   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--   created_at TIMESTAMP DEFAULT NOW(),
--   updated_at TIMESTAMP DEFAULT NOW()
-- );

-- -- 2. 创建用户配置表
-- -- ===============================================
-- CREATE TABLE profiles (
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   username TEXT UNIQUE,
--   full_name TEXT,
--   avatar_url TEXT,
--   bio TEXT,
--   created_at TIMESTAMP DEFAULT NOW(),
--   updated_at TIMESTAMP DEFAULT NOW()
-- );

-- -- 3. 创建评论表
-- -- ===============================================
-- CREATE TABLE comments (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
--   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--   content TEXT NOT NULL,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- -- 4. 创建标签表（可选扩展功能）
-- -- ===============================================
-- CREATE TABLE tags (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name TEXT UNIQUE NOT NULL,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- -- 5. 创建文章标签关联表（可选扩展功能）
-- -- ===============================================
-- CREATE TABLE post_tags (
--   post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
--   tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
--   PRIMARY KEY (post_id, tag_id)
-- );

-- -- 6. 创建索引以提高查询性能
-- -- ===============================================
-- CREATE INDEX posts_user_id_idx ON posts(user_id);
-- CREATE INDEX posts_published_idx ON posts(published);
-- CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
-- CREATE INDEX posts_slug_idx ON posts(slug);
-- CREATE INDEX comments_post_id_idx ON comments(post_id);
-- CREATE INDEX comments_user_id_idx ON comments(user_id);
-- CREATE INDEX profiles_username_idx ON profiles(username);

-- -- 7. 启用行级安全 (RLS)
-- -- ===============================================
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- -- 8. 创建 RLS 策略 - Posts 表
-- -- ===============================================

-- -- 公开已发布的文章可以被所有人查看
-- CREATE POLICY "公开文章可以被所有人查看" ON posts
--   FOR SELECT USING (published = true);

-- -- 用户可以查看自己的所有文章（包括草稿）
-- CREATE POLICY "用户可以查看自己的文章" ON posts
--   FOR SELECT USING (auth.uid() = user_id);

-- -- 登录用户可以创建文章
-- CREATE POLICY "用户可以创建文章" ON posts
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- -- 用户可以更新自己的文章
-- CREATE POLICY "用户可以更新自己的文章" ON posts
--   FOR UPDATE USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- -- 用户可以删除自己的文章
-- CREATE POLICY "用户可以删除自己的文章" ON posts
--   FOR DELETE USING (auth.uid() = user_id);

-- -- 9. 创建 RLS 策略 - Profiles 表
-- -- ===============================================

-- -- 所有用户配置可以被查看（用于显示作者信息）
-- CREATE POLICY "用户配置可以被所有人查看" ON profiles
--   FOR SELECT USING (true);

-- -- 用户只能创建自己的配置
-- CREATE POLICY "用户可以创建自己的配置" ON profiles
--   FOR INSERT WITH CHECK (auth.uid() = id);

-- -- 用户只能更新自己的配置
-- CREATE POLICY "用户可以更新自己的配置" ON profiles
--   FOR UPDATE USING (auth.uid() = id)
--   WITH CHECK (auth.uid() = id);

-- -- 用户可以删除自己的配置
-- CREATE POLICY "用户可以删除自己的配置" ON profiles
--   FOR DELETE USING (auth.uid() = id);

-- -- 10. 创建 RLS 策略 - Comments 表
-- -- ===============================================

-- -- 所有评论可以被查看
-- CREATE POLICY "评论可以被所有人查看" ON comments
--   FOR SELECT USING (true);

-- -- 登录用户可以创建评论
-- CREATE POLICY "登录用户可以创建评论" ON comments
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- -- 用户可以更新自己的评论
-- CREATE POLICY "用户可以更新自己的评论" ON comments
--   FOR UPDATE USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- -- 用户可以删除自己的评论
-- CREATE POLICY "用户可以删除自己的评论" ON comments
--   FOR DELETE USING (auth.uid() = user_id);

-- -- 11. 创建 RLS 策略 - Tags 表（可选）
-- -- ===============================================

-- -- 所有标签可以被查看
-- CREATE POLICY "标签可以被所有人查看" ON tags
--   FOR SELECT USING (true);

-- -- 登录用户可以创建标签
-- CREATE POLICY "登录用户可以创建标签" ON tags
--   FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- -- 12. 创建 RLS 策略 - Post_tags 表（可选）
-- -- ===============================================

-- -- 文章标签关联可以被查看
-- CREATE POLICY "文章标签关联可以被所有人查看" ON post_tags
--   FOR SELECT USING (true);

-- -- 文章作者可以管理文章的标签
-- CREATE POLICY "文章作者可以管理标签" ON post_tags
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM posts 
--       WHERE posts.id = post_tags.post_id 
--       AND posts.user_id = auth.uid()
--     )
--   );

-- -- 13. 创建触发器函数 - 自动更新 updated_at
-- -- ===============================================
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- 14. 创建触发器
-- -- ===============================================
-- CREATE TRIGGER update_posts_updated_at
--     BEFORE UPDATE ON posts
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_profiles_updated_at
--     BEFORE UPDATE ON profiles
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- -- 15. 创建用户注册触发器函数
-- -- ===============================================
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, username, full_name)
--   VALUES (
--     NEW.id,
--     COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
--     COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- -- 16. 创建用户注册触发器
-- -- ===============================================
-- CREATE OR REPLACE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -- ===============================================
-- -- 数据库设置完成！
-- -- ===============================================
-- -- 
-- -- 接下来你可以：
-- -- 1. 访问 http://localhost:3000 查看博客
-- -- 2. 注册一个新账户
-- -- 3. 发布你的第一篇文章
-- -- 4. 体验评论功能
-- --
-- -- 如果遇到问题，请检查：
-- -- - 环境变量是否正确设置
-- -- - Supabase 项目是否正常运行
-- -- - 网络连接是否正常 