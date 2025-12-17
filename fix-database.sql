-- -- ===============================================
-- -- 数据库修复脚本
-- -- ===============================================
-- -- 用于修复已存在用户的 profiles 记录问题

-- -- 1. 为现有用户创建 profiles 记录
-- -- ===============================================
-- INSERT INTO profiles (id, username, full_name)
-- SELECT 
--   au.id,
--   split_part(au.email, '@', 1) as username,
--   au.email as full_name
-- FROM auth.users au
-- WHERE NOT EXISTS (
--   SELECT 1 FROM profiles p WHERE p.id = au.id
-- );

-- -- 2. 确保触发器函数存在且正确
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

-- -- 3. 重新创建触发器（如果不存在）
-- -- ===============================================
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -- 4. 验证修复结果
-- -- ===============================================
-- -- 运行此查询检查是否所有用户都有对应的 profile
-- SELECT 
--   'Users without profiles:' as check_type,
--   COUNT(*) as count
-- FROM auth.users au
-- LEFT JOIN profiles p ON au.id = p.id
-- WHERE p.id IS NULL

-- UNION ALL

-- SELECT 
--   'Total users:' as check_type,
--   COUNT(*) as count
-- FROM auth.users

-- UNION ALL

-- SELECT 
--   'Total profiles:' as check_type,
--   COUNT(*) as count
-- FROM profiles;

-- -- 修复完成！ 