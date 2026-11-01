CREATE TABLE `admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`email` varchar(200) NOT NULL,
	`password_hash` text NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'lab_admin',
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`avatar_color` varchar(50) DEFAULT '#6366f1',
	`last_login` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `admins_email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`admin_id` int,
	`action` varchar(100) NOT NULL,
	`description` text,
	`entity_type` varchar(50),
	`entity_id` int,
	`ip_address` varchar(50),
	`user_agent` text,
	`timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batch_students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`batch_id` int NOT NULL,
	`student_id` int NOT NULL,
	`assigned_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`status` varchar(50) DEFAULT 'active',
	CONSTRAINT `batch_students_id` PRIMARY KEY(`id`),
	CONSTRAINT `batch_students_uniq` UNIQUE(`batch_id`,`student_id`)
);
--> statement-breakpoint
CREATE TABLE `batches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`batch_name` varchar(250) NOT NULL,
	`course` varchar(100) NOT NULL,
	`department` varchar(150) NOT NULL,
	`semester` varchar(50) NOT NULL,
	`academic_year` varchar(30) NOT NULL,
	`capacity` int NOT NULL DEFAULT 40,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `computers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`computer_number` varchar(50) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'available',
	`location` varchar(150) DEFAULT 'Lab A',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `computers_id` PRIMARY KEY(`id`),
	CONSTRAINT `computers_number_idx` UNIQUE(`computer_number`)
);
--> statement-breakpoint
CREATE TABLE `lab_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`batch_id` int,
	`student_id` int NOT NULL,
	`computer_id` int NOT NULL,
	`started_by_admin_id` int,
	`start_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`end_time` datetime,
	`duration_seconds` int DEFAULT 0,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `lab_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(200) NOT NULL,
	`admin_id` int,
	`success` boolean NOT NULL DEFAULT false,
	`reason` varchar(100),
	`ip_address` varchar(50),
	`timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `login_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`admin_id` int,
	`title` varchar(200) NOT NULL,
	`message` text,
	`type` varchar(50) DEFAULT 'info',
	`read` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_id` int,
	`student_id` int,
	`computer_id` int,
	`action_type` varchar(100) NOT NULL,
	`description` text,
	`timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `session_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`usn` varchar(50) NOT NULL,
	`course` varchar(100) NOT NULL,
	`department` varchar(150) NOT NULL,
	`semester` varchar(50) NOT NULL,
	`academic_year` varchar(30) NOT NULL,
	`email` varchar(200),
	`phone` varchar(30),
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`qr_id` varchar(100) NOT NULL,
	`avatar_color` varchar(50) DEFAULT '#6366f1',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	`deleted_by` int,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_usn_idx` UNIQUE(`usn`)
);
--> statement-breakpoint
CREATE INDEX `audit_logs_admin_idx` ON `audit_logs` (`admin_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_timestamp_idx` ON `audit_logs` (`timestamp`);--> statement-breakpoint
CREATE INDEX `batch_students_batch_idx` ON `batch_students` (`batch_id`);--> statement-breakpoint
CREATE INDEX `batch_students_student_idx` ON `batch_students` (`student_id`);--> statement-breakpoint
CREATE INDEX `batches_status_idx` ON `batches` (`status`);--> statement-breakpoint
CREATE INDEX `lab_sessions_student_idx` ON `lab_sessions` (`student_id`);--> statement-breakpoint
CREATE INDEX `lab_sessions_computer_idx` ON `lab_sessions` (`computer_id`);--> statement-breakpoint
CREATE INDEX `lab_sessions_batch_idx` ON `lab_sessions` (`batch_id`);--> statement-breakpoint
CREATE INDEX `lab_sessions_status_idx` ON `lab_sessions` (`status`);--> statement-breakpoint
CREATE INDEX `login_attempts_email_idx` ON `login_attempts` (`email`);--> statement-breakpoint
CREATE INDEX `login_attempts_timestamp_idx` ON `login_attempts` (`timestamp`);--> statement-breakpoint
CREATE INDEX `session_actions_session_idx` ON `session_actions` (`session_id`);--> statement-breakpoint
CREATE INDEX `session_actions_timestamp_idx` ON `session_actions` (`timestamp`);--> statement-breakpoint
CREATE INDEX `students_email_idx` ON `students` (`email`);--> statement-breakpoint
CREATE INDEX `students_status_idx` ON `students` (`status`);--> statement-breakpoint
CREATE INDEX `students_course_idx` ON `students` (`course`);