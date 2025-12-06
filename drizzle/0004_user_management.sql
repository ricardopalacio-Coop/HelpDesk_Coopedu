CREATE TABLE `user_profile_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`role` enum('user','admin','gerente','atendente') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profile_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint

INSERT INTO `user_profile_types` (`name`, `description`, `role`)
VALUES 
  ('Administrador', 'Acesso completo ao sistema', 'admin'),
  ('Gerente', 'Permissões de gestão e relatórios', 'gerente'),
  ('Atendente', 'Foco em atendimento e tickets', 'atendente'),
  ('Usuário', 'Perfil padrão com acesso limitado', 'user');
--> statement-breakpoint

ALTER TABLE `profiles` 
  ADD `nickname` varchar(120),
  ADD `phone` varchar(32),
  ADD `avatarUrl` text,
  ADD `profileTypeId` int;
--> statement-breakpoint

ALTER TABLE `profiles` 
  ADD CONSTRAINT `profiles_profileTypeId_user_profile_types_id_fk` 
  FOREIGN KEY (`profileTypeId`) REFERENCES `user_profile_types`(`id`) 
  ON DELETE SET NULL 
  ON UPDATE NO ACTION;
--> statement-breakpoint

CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
--> statement-breakpoint
