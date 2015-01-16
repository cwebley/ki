CREATE TABLE `characters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `season` int(11) NOT NULL,
  PRIMARY KEY (`id`)
);

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
	('omen',2);

CREATE TABLE `players` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`name` varchar(255) NOT NULL,
	PRIMARY KEY (`id`)
);

INSERT INTO players (name) VALUES
	('g'),
	('bj');
