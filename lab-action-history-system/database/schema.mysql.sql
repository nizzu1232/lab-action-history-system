-- ============================================================
--  Lab Action History Management System
--  MySQL schema for database: nizzu
-- ============================================================

CREATE DATABASE IF NOT EXISTS nizzu
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nizzu;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS session_actions;
DROP TABLE IF EXISTS lab_sessions;
DROP TABLE IF EXISTS computers;
DROP TABLE IF EXISTS batch_students;
DROP TABLE IF EXISTS batches;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS admins;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------- admins ----------
CREATE TABLE admins (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(200) NOT NULL,
  email          VARCHAR(200) NOT NULL,
  password_hash  TEXT NOT NULL,
  role           VARCHAR(50)  NOT NULL DEFAULT 'lab_admin',
  status         VARCHAR(50)  NOT NULL DEFAULT 'active',
  avatar_color   VARCHAR(50)  DEFAULT '#6366f1',
  last_login     TIMESTAMP NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY admins_email_idx (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- students ----------
CREATE TABLE students (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(200) NOT NULL,
  usn            VARCHAR(50)  NOT NULL,
  course         VARCHAR(100) NOT NULL,
  department     VARCHAR(150) NOT NULL,
  semester       VARCHAR(50)  NOT NULL,
  academic_year  VARCHAR(30)  NOT NULL,
  email          VARCHAR(200),
  phone          VARCHAR(30),
  status         VARCHAR(50)  NOT NULL DEFAULT 'active',
  qr_id          VARCHAR(100) NOT NULL,
  avatar_color   VARCHAR(50)  DEFAULT '#6366f1',
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at     TIMESTAMP NULL,
  deleted_by     INT,
  UNIQUE KEY students_usn_idx (usn),
  KEY students_email_idx  (email),
  KEY students_status_idx (status),
  KEY students_course_idx (course)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- batches (no batch_code, no section) ----------
CREATE TABLE batches (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  batch_name     VARCHAR(250) NOT NULL,
  course         VARCHAR(100) NOT NULL,
  department     VARCHAR(150) NOT NULL,
  semester       VARCHAR(50)  NOT NULL,
  academic_year  VARCHAR(30)  NOT NULL,
  capacity       INT NOT NULL DEFAULT 40,
  status         VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY batches_status_idx (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- batch_students ----------
CREATE TABLE batch_students (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  batch_id       INT NOT NULL,
  student_id     INT NOT NULL,
  assigned_date  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status         VARCHAR(50) DEFAULT 'active',
  UNIQUE KEY batch_students_uniq (batch_id, student_id),
  KEY batch_students_batch_idx   (batch_id),
  KEY batch_students_student_idx (student_id),
  CONSTRAINT fk_bs_batch   FOREIGN KEY (batch_id)   REFERENCES batches(id)  ON DELETE CASCADE,
  CONSTRAINT fk_bs_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- computers ----------
CREATE TABLE computers (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  computer_number  VARCHAR(50)  NOT NULL,
  status           VARCHAR(50)  NOT NULL DEFAULT 'available',
  location         VARCHAR(150) DEFAULT 'Lab A',
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY computers_number_idx (computer_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- lab_sessions ----------
CREATE TABLE lab_sessions (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  batch_id            INT,
  student_id          INT NOT NULL,
  computer_id         INT NOT NULL,
  started_by_admin_id INT,
  start_time          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time            TIMESTAMP NULL,
  duration_seconds    INT DEFAULT 0,
  status              VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY lab_sessions_student_idx  (student_id),
  KEY lab_sessions_computer_idx (computer_id),
  KEY lab_sessions_batch_idx    (batch_id),
  KEY lab_sessions_status_idx   (status),
  CONSTRAINT fk_ls_student  FOREIGN KEY (student_id)  REFERENCES students(id)  ON DELETE CASCADE,
  CONSTRAINT fk_ls_computer FOREIGN KEY (computer_id) REFERENCES computers(id),
  CONSTRAINT fk_ls_batch    FOREIGN KEY (batch_id)    REFERENCES batches(id),
  CONSTRAINT fk_ls_admin    FOREIGN KEY (started_by_admin_id) REFERENCES admins(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- session_actions ----------
CREATE TABLE session_actions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  session_id   INT,
  student_id   INT,
  computer_id  INT,
  action_type  VARCHAR(100) NOT NULL,
  description  TEXT,
  timestamp    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY session_actions_session_idx   (session_id),
  KEY session_actions_timestamp_idx (timestamp),
  CONSTRAINT fk_sa_session  FOREIGN KEY (session_id)  REFERENCES lab_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_sa_student  FOREIGN KEY (student_id)  REFERENCES students(id)     ON DELETE CASCADE,
  CONSTRAINT fk_sa_computer FOREIGN KEY (computer_id) REFERENCES computers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- audit_logs ----------
CREATE TABLE audit_logs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  admin_id     INT,
  action       VARCHAR(100) NOT NULL,
  description  TEXT,
  entity_type  VARCHAR(50),
  entity_id    INT,
  ip_address   VARCHAR(50),
  user_agent   TEXT,
  timestamp    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY audit_logs_admin_idx     (admin_id),
  KEY audit_logs_timestamp_idx (timestamp),
  CONSTRAINT fk_al_admin FOREIGN KEY (admin_id) REFERENCES admins(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- login_attempts ----------
CREATE TABLE login_attempts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(200) NOT NULL,
  admin_id    INT,
  success     BOOLEAN NOT NULL DEFAULT FALSE,
  reason      VARCHAR(100),
  ip_address  VARCHAR(50),
  timestamp   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY login_attempts_email_idx     (email),
  KEY login_attempts_timestamp_idx (timestamp),
  CONSTRAINT fk_la_admin FOREIGN KEY (admin_id) REFERENCES admins(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- notifications ----------
CREATE TABLE notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  admin_id   INT,
  title      VARCHAR(200) NOT NULL,
  message    TEXT,
  type       VARCHAR(50) DEFAULT 'info',
  `read`     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_n_admin FOREIGN KEY (admin_id) REFERENCES admins(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
