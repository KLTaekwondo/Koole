-- =============================================
-- Koole 数据库字符集统一脚本
-- 将整个数据库和所有表字段统一为 utf8mb4
-- 支持 emoji 和完整的 Unicode 字符
-- =============================================
use koole_db;
-- 1. 修改数据库默认字符集
ALTER DATABASE koole_db CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 2. 修改所有表的默认字符集
ALTER TABLE t_article CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_article_tag CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_comment CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_tag CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_update_post CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_user CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. 单独确保字符串字段为 utf8mb4（可选，CONVERT TO 已经包含字段）
-- 如果某些字段已经是 utf8mb4，下面的语句会报错，可以忽略或注释掉
ALTER TABLE t_article MODIFY title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_article MODIFY content LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_article MODIFY summary VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE t_comment MODIFY content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE t_tag MODIFY tag_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE t_update_post MODIFY title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_update_post MODIFY content LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE t_user MODIFY username VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_user MODIFY email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_user MODIFY phone VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;