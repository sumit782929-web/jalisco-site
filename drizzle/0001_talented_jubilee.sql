CREATE TABLE `availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceDate` varchar(10) NOT NULL,
	`timeSlot` varchar(5) NOT NULL,
	`capacity` int NOT NULL DEFAULT 12,
	`isOpen` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `availability_service_slot_idx` ON `availability` (`serviceDate`,`timeSlot`);