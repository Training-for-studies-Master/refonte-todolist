CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS task_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS project_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS notification_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS notification_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Attribution des privilèges à l'utilisateur pour chaque base
GRANT ALL PRIVILEGES ON auth_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON task_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON project_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON notification_db.* TO 'app_user'@'%';

-- Application des nouveaux droits
FLUSH PRIVILEGES;