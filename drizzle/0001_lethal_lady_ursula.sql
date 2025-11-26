CREATE TABLE `attendance_reasons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`slaHours` int NOT NULL DEFAULT 48,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendance_reasons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cooperadoId` int,
	`name` varchar(255) NOT NULL,
	`status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
	`validityDate` date,
	`isSpecial` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cooperado_bank_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cooperadoId` int NOT NULL,
	`bankCode` varchar(10) NOT NULL,
	`bankName` varchar(255) NOT NULL,
	`accountType` enum('salario','corrente','poupanca') NOT NULL,
	`agency` varchar(10) NOT NULL,
	`accountNumber` varchar(20) NOT NULL,
	`accountDigit` varchar(2),
	`pixKey` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cooperado_bank_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cooperado_phones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cooperadoId` int NOT NULL,
	`phone` varchar(20) NOT NULL,
	`phoneType` enum('principal','secundario','whatsapp') NOT NULL DEFAULT 'principal',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cooperado_phones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cooperados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`registrationNumber` bigint NOT NULL,
	`name` varchar(255) NOT NULL,
	`document` varchar(20) NOT NULL,
	`birthDate` date,
	`admissionDate` date,
	`terminationDate` date,
	`position` varchar(255),
	`status` enum('ativo','inativo','sem_producao') NOT NULL DEFAULT 'ativo',
	`contractId` int,
	`email` varchar(255),
	`address` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cooperados_id` PRIMARY KEY(`id`),
	CONSTRAINT `cooperados_registrationNumber_unique` UNIQUE(`registrationNumber`)
);
--> statement-breakpoint
CREATE TABLE `csat_surveys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`cooperadoId` int NOT NULL,
	`rating` int,
	`comment` text,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`answeredAt` timestamp,
	`status` enum('pending','answered','expired') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `csat_surveys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`responsibleUserId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `departments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`departmentId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`isOnLeave` boolean NOT NULL DEFAULT false,
	`leaveStartDate` date,
	`leaveEndDate` date,
	`passwordExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`oldValue` text,
	`newValue` text,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`senderType` enum('cooperado','atendente','sistema') NOT NULL,
	`senderId` int,
	`message` text NOT NULL,
	`mediaUrl` text,
	`whatsappMessageId` varchar(255),
	`isFromWhatsapp` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_time_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`departmentId` int NOT NULL,
	`userId` int NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`pausedAt` timestamp,
	`resumedAt` timestamp,
	`finishedAt` timestamp,
	`totalSeconds` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_time_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`protocol` varchar(20) NOT NULL,
	`cooperadoId` int,
	`contractId` int NOT NULL,
	`reasonId` int NOT NULL,
	`status` enum('aberto','em_andamento','aguardando_cooperado','aguardando_departamento','resolvido','fechado','fechado_sem_interacao') NOT NULL DEFAULT 'aberto',
	`priority` enum('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
	`description` text NOT NULL,
	`assignedTo` int,
	`currentDepartmentId` int NOT NULL,
	`slaDeadline` timestamp,
	`lastInteractionAt` timestamp DEFAULT (now()),
	`openedAt` timestamp NOT NULL DEFAULT (now()),
	`closedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `tickets_protocol_unique` UNIQUE(`protocol`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionName` varchar(100) NOT NULL,
	`phoneNumber` varchar(20),
	`qrCode` text,
	`status` enum('disconnected','qr_ready','connected') NOT NULL DEFAULT 'disconnected',
	`connectedAt` timestamp,
	`disconnectedAt` timestamp,
	`sessionData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsapp_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','gerente','atendente') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `attendance_reasons` ADD CONSTRAINT `attendance_reasons_parentId_attendance_reasons_id_fk` FOREIGN KEY (`parentId`) REFERENCES `attendance_reasons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_cooperadoId_cooperados_id_fk` FOREIGN KEY (`cooperadoId`) REFERENCES `cooperados`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cooperado_bank_data` ADD CONSTRAINT `cooperado_bank_data_cooperadoId_cooperados_id_fk` FOREIGN KEY (`cooperadoId`) REFERENCES `cooperados`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cooperado_phones` ADD CONSTRAINT `cooperado_phones_cooperadoId_cooperados_id_fk` FOREIGN KEY (`cooperadoId`) REFERENCES `cooperados`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cooperados` ADD CONSTRAINT `cooperados_contractId_contracts_id_fk` FOREIGN KEY (`contractId`) REFERENCES `contracts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `csat_surveys` ADD CONSTRAINT `csat_surveys_ticketId_tickets_id_fk` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `csat_surveys` ADD CONSTRAINT `csat_surveys_cooperadoId_cooperados_id_fk` FOREIGN KEY (`cooperadoId`) REFERENCES `cooperados`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_responsibleUserId_users_id_fk` FOREIGN KEY (`responsibleUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_departmentId_departments_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticket_history` ADD CONSTRAINT `ticket_history_ticketId_tickets_id_fk` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticket_history` ADD CONSTRAINT `ticket_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticket_messages` ADD CONSTRAINT `ticket_messages_ticketId_tickets_id_fk` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticket_messages` ADD CONSTRAINT `ticket_messages_senderId_users_id_fk` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticket_time_tracking` ADD CONSTRAINT `ticket_time_tracking_ticketId_tickets_id_fk` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticket_time_tracking` ADD CONSTRAINT `ticket_time_tracking_departmentId_departments_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticket_time_tracking` ADD CONSTRAINT `ticket_time_tracking_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_cooperadoId_cooperados_id_fk` FOREIGN KEY (`cooperadoId`) REFERENCES `cooperados`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_contractId_contracts_id_fk` FOREIGN KEY (`contractId`) REFERENCES `contracts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_reasonId_attendance_reasons_id_fk` FOREIGN KEY (`reasonId`) REFERENCES `attendance_reasons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_assignedTo_users_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_currentDepartmentId_departments_id_fk` FOREIGN KEY (`currentDepartmentId`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;