CREATE TABLE `chapters` (
	`id` text PRIMARY KEY NOT NULL,
	`novel_id` text NOT NULL,
	`chapter_num` integer NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`opening_hook` text,
	`conflict` text,
	`climax` text,
	`ending_hook` text,
	`word_count` integer DEFAULT 0 NOT NULL,
	`satisfaction_score` integer DEFAULT 0 NOT NULL,
	`tension_level` integer DEFAULT 5 NOT NULL,
	`emotion_type` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`novel_id` text NOT NULL,
	`name` text NOT NULL,
	`title` text,
	`role` text NOT NULL,
	`gender` text DEFAULT 'male' NOT NULL,
	`appearance` text,
	`personality` text,
	`backstory` text,
	`catchphrase` text,
	`affection` integer DEFAULT 0 NOT NULL,
	`loyalty` integer DEFAULT 50 NOT NULL,
	`desire` integer DEFAULT 0 NOT NULL,
	`fear` integer DEFAULT 0 NOT NULL,
	`dependence` integer DEFAULT 0 NOT NULL,
	`darkness` integer DEFAULT 0 NOT NULL,
	`combat_power` integer DEFAULT 10 NOT NULL,
	`charm` integer DEFAULT 50 NOT NULL,
	`function_type` text,
	`romantic_line` text,
	`notable_scene` text,
	`desire_driver` text,
	`status` text DEFAULT 'active' NOT NULL,
	`first_appear` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `foreshadows` (
	`id` text PRIMARY KEY NOT NULL,
	`novel_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`planted_chapter` integer NOT NULL,
	`resolved_chapter` integer,
	`status` text DEFAULT 'planted' NOT NULL,
	`importance` integer DEFAULT 5 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `memories` (
	`id` text PRIMARY KEY NOT NULL,
	`novel_id` text NOT NULL,
	`chapter_id` text,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`importance` integer DEFAULT 5 NOT NULL,
	`chapter_num` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `novels` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`genre` text NOT NULL,
	`sub_genres` text DEFAULT '[]' NOT NULL,
	`style` text DEFAULT '番茄男频' NOT NULL,
	`description` text,
	`target_chapters` integer DEFAULT 500 NOT NULL,
	`status` text DEFAULT 'planning' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plot_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`novel_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'planned' NOT NULL,
	`priority` integer DEFAULT 5 NOT NULL,
	`start_chapter` integer,
	`end_chapter` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rhythm_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`novel_id` text NOT NULL,
	`chapter_num` integer NOT NULL,
	`has_climax` integer DEFAULT false NOT NULL,
	`heroine_appear` integer DEFAULT false NOT NULL,
	`face_slap` integer DEFAULT false NOT NULL,
	`tension_score` integer DEFAULT 5 NOT NULL,
	`suggestion` text,
	`checked_at` text NOT NULL,
	FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `satisfaction_points` (
	`id` text PRIMARY KEY NOT NULL,
	`novel_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`formula` text,
	`intensity` integer DEFAULT 5 NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`used_chapter` integer,
	`tags` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `worlds` (
	`id` text PRIMARY KEY NOT NULL,
	`novel_id` text NOT NULL,
	`era` text,
	`timeline` text DEFAULT '[]' NOT NULL,
	`locations` text DEFAULT '[]' NOT NULL,
	`resources` text DEFAULT '{}' NOT NULL,
	`power_system` text,
	`factions` text,
	`rules` text,
	FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON UPDATE no action ON DELETE cascade
);
