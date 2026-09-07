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
CREATE TABLE `reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(160) NOT NULL,
	`phoneNumber` varchar(32) NOT NULL,
	`email` varchar(320) NOT NULL,
	`reservationDate` varchar(10) NOT NULL,
	`timeSlot` varchar(5) NOT NULL,
	`guestCount` int NOT NULL,
	`specialRequests` text,
	`paymentMethod` enum('upi','card','international') NOT NULL,
	`depositAmount` int NOT NULL DEFAULT 500,
	`currency` varchar(3) NOT NULL DEFAULT 'INR',
	`paymentStatus` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`reservationStatus` enum('pending','confirmed','cancelled','rejected') NOT NULL DEFAULT 'pending',
	`provider` varchar(32) NOT NULL DEFAULT 'gateway_pending',
	`providerOrderId` varchar(160),
	`providerPaymentId` varchar(160),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `availability_service_slot_idx` ON `availability` (`serviceDate`,`timeSlot`);--> statement-breakpoint
CREATE INDEX `reservations_date_slot_idx` ON `reservations` (`reservationDate`,`timeSlot`);--> statement-breakpoint
CREATE INDEX `reservations_payment_status_idx` ON `reservations` (`paymentStatus`);--> statement-breakpoint
CREATE INDEX `reservations_reservation_status_idx` ON `reservations` (`reservationStatus`);