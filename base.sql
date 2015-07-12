CREATE TABLE `characters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `season` int(11) NOT NULL,
  PRIMARY KEY (`id`)
);

-- N/A character to satisfy `history` foreign key edgecases where the character is not important
INSERT INTO characters (id, name) VALUES
	(99999, 'NA');

INSERT INTO characters (name, season) VALUES
	('jago',1),
	('wulf',1),
	('orchid',1),
	('thunder',1),
	('spinal',1),
	('fulgore',1),
	('glacius',1),
	('sadira',1),
	('tj',2),
	('maya',2),
	('kanra',2),
	('riptor',2),
	('omen',2),
	('aganos',2),
	('hisako',2),
	('aria',2);

CREATE TABLE `users` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`name` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`email` varchar(255),
	`tournamentWins` int(11) NOT NULL DEFAULT 0,
	`tournamentLosses` int(11) NOT NULL DEFAULT 0,
	`wins` int(11) NOT NULL DEFAULT 0,
	`losses` int(11) NOT NULL DEFAULT 0,
	`globalBestStreak` int(11) NOT NULL DEFAULT 0,
	UNIQUE KEY `name` (`name`),
	PRIMARY KEY (`id`)
);

-- INSERT INTO users (name,password) VALUES
-- 	('g','foo'),
-- 	('bj','foo');

CREATE TABLE `tournaments` (
	`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name` varchar(255) NOT NULL,
	`goal` int(11) NOT NULL,
	`championId` int(11),
	`seeded` bool DEFAULT false,
	`active` bool DEFAULT true,
	`time` timestamp DEFAULT current_timestamp,
	UNIQUE KEY `name` (`name`),
	FOREIGN KEY (`championId`) REFERENCES `users`(`id`)
);	

CREATE TABLE `tournamentUsers` (
	`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`tournamentId` int(11) NOT NULL,
	`userId` int(11) NOT NULL,
	`seeded` bool DEFAULT false,
	`wins` int(11) NOT NULL DEFAULT 0,
	`losses` int(11) NOT NULL DEFAULT 0,
	`curStreak` int(11) NOT NULL DEFAULT 0,
	`bestStreak` int(11) NOT NULL DEFAULT 0,
	`score` int(11) NOT NULL DEFAULT 0,
	`fireWins` int(11) NOT NULL DEFAULT 0,
	UNIQUE KEY `tournamentPlayer` (`tournamentId`,`userId`),
	FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
);

CREATE TABLE `tournamentPowers` (
	`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`tournamentId` int(11) NOT NULL,
	`userId` int(11) NOT NULL,
	`stock` int(11) NOT NULL DEFAULT 0,
	`active` int(11) NOT NULL DEFAULT 0,
	UNIQUE KEY `tournament-user` (`tournamentId`,`userId`),
	FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
);

CREATE TABLE `games` (
	`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`winningPlayerId` int(11) NOT NULL,
	`winningCharacterId` int(11) NOT NULL,
	`losingPlayerId` int(11) NOT NULL,
	`losingCharacterId` int(11) NOT NULL,
	`value` int(11) DEFAULT 0,
	`tournamentId` int(11) NOT NULL,
	`supreme` bool DEFAULT false,
	`time` timestamp DEFAULT current_timestamp,
	FOREIGN KEY (`winningPlayerId`) REFERENCES `users`(`id`),
	FOREIGN KEY (`winningCharacterId`) REFERENCES `characters`(`id`),
	FOREIGN KEY (`losingPlayerId`) REFERENCES `users`(`id`),
	FOREIGN KEY (`losingCharacterId`) REFERENCES `characters`(`id`),
	FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`)
);

CREATE TABLE `seeds` (
	`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`tournamentId` int(11) NOT NULL,
	`userId` int(11) NOT NULL,
	`characterId` int(11) NOT NULL,
	`value` int(11) NOT NULL DEFAULT 0,
	UNIQUE `touranment-seed` (`tournamentId`, `userId`,`characterId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
	FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`)
);


CREATE TABLE `charactersData` (
	`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`userId` int(11) NOT NULL,
	`characterId` int(11) NOT NULL,
	`wins` int(11) NOT NULL DEFAULT 0,
	`losses` int(11) NOT NULL DEFAULT 0,
	`globalBestStreak` int(11) NOT NULL DEFAULT 0,
	`fireWins` int(11) NOT NULL DEFAULT 0,
	UNIQUE `user-character` (`userId`,`characterId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
	FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`)
);

CREATE TABLE `tournamentCharacters` (
	`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`tournamentId` int(11) NOT NULL,
	`userId` int(11) NOT NULL,
	`characterId` int(11) NOT NULL,
	`value` int(11) NOT NULL,
	`wins` int(11) NOT NULL DEFAULT 0,
	`losses` int(11) NOT NULL DEFAULT 0,
	`curStreak` int(11) NOT NULL DEFAULT 0,
	`bestStreak` int(11) NOT NULL DEFAULT 0,
	`fireWins` int(11) NOT NULL DEFAULT 0,
	UNIQUE `tournament-user-character` (`tournamentId`,`userId`,`characterId`),
	FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
	FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`)
);

CREATE TABLE `events` (
	`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`description` varchar(255) NOT NULL
);

INSERT INTO events (description) VALUES
	('seeding'),
	('game'),
	('fire'),
	('friendlyFire'),
	('ice'),
	('friendlyIce'),
	('power-reseed'),
	('power-deduct-points'),
	('power-deduct-exipres'),
	('power-oddsMaker'),
	('power-inspect'),
	('power-init');

CREATE TABLE `history` (
	`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`tournamentId` int(11) NOT NULL,
	`userId` int(11) NOT NULL,
	`characterId` int(11) NOT NULL,
	`eventId` int(11) NOT NULL,
	`value` int(11) DEFAULT 0,
	`delta` int(11) DEFAULT 0,
	`time` timestamp DEFAULT current_timestamp,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
	FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`),
	FOREIGN KEY (`eventId`) REFERENCES `events`(`id`)
);


ALTER TABLE `tournaments` ADD slug VARCHAR(255) AFTER name