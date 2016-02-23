CREATE TABLE IF NOT EXISTS characters (
	id serial NOT NULL PRIMARY KEY,
	name varchar(25) NOT NULL,
	season serial NOT NULL
);

-- -- N/A character to satisfy `history` foreign key edgecases where the character is not important
INSERT INTO characters (name) VALUES
	('NA')
;

INSERT INTO characters (name, season) VALUES
	('jago', 1),
	('wulf', 1),
	('orchid', 1),
	('thunder', 1),
	('spinal', 1),
	('fulgore', 1),
	('glacius', 1),
	('sadira', 1),
	('tj', 2),
	('maya', 2),
	('kanra', 2),
	('riptor', 2),
	('omen', 2),
	('aganos', 2),
	('hisako', 2),
	('aria', 2),
	('shadowjago', 1),
	('rash', 3)
;

CREATE TABLE IF NOT EXISTS users (
	id serial NOT NULL PRIMARY KEY,
	name varchar(255) NOT NULL UNIQUE,
	password varchar(255) NOT NULL,
	email varchar(255),
	tournamentWins integer NOT NULL DEFAULT 0,
	tournamentLosses integer NOT NULL DEFAULT 0,
	wins integer NOT NULL DEFAULT 0,
	losses integer NOT NULL DEFAULT 0,
	globalBestStreak integer NOT NULL DEFAULT 0
);

INSERT INTO users (name,password) VALUES
	('g','foo'),
	('bj','foo');

CREATE TABLE IF NOT EXISTS tournaments (
	id serial NOT NULL PRIMARY KEY,
	name varchar(25) NOT NULL UNIQUE,
	slug varchar(25) NOT NULL UNIQUE,
	goal integer NOT NULL,
	championId integer REFERENCES users (id),
	seeded boolean DEFAULT false,
	active boolean DEFAULT true,
	time timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tournamentUsers (
	id serial NOT NULL PRIMARY KEY,
	tournamentId integer NOT NULL REFERENCES tournaments (id),
	userId integer NOT NULL REFERENCES users (id),
	seeded bool DEFAULT false,
	wins integer NOT NULL DEFAULT 0,
	losses integer NOT NULL DEFAULT 0,
	curStreak integer NOT NULL DEFAULT 0,
	bestStreak integer NOT NULL DEFAULT 0,
	score integer NOT NULL DEFAULT 0,
	fireWins integer NOT NULL DEFAULT 0,
	UNIQUE (tournamentId, userId)
);

CREATE TABLE IF NOT EXISTS tournamentPowers (
	id serial NOT NULL PRIMARY KEY,
	tournamentId integer NOT NULL REFERENCES tournaments (id),
	userId integer NOT NULL REFERENCES users (id),
	stock integer NOT NULL DEFAULT 0,
	active integer NOT NULL DEFAULT 0,
	UNIQUE (tournamentId, userId)
);

CREATE TABLE IF NOT EXISTS games (
	id serial NOT NULL PRIMARY KEY,
	winningPlayerId integer NOT NULL REFERENCES users (id),
	winningCharacterId integer NOT NULL REFERENCES characters (id),
	losingPlayerId integer NOT NULL REFERENCES users (id),
	losingCharacterId integer NOT NULL REFERENCES characters (id),
	value integer DEFAULT 0,
	tournamentId integer NOT NULL REFERENCES tournaments (id),
	supreme boolean DEFAULT false,
	time timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seeds (
	id serial NOT NULL PRIMARY KEY,
	tournamentId integer NOT NULL REFERENCES tournaments (id),
	userId integer NOT NULL REFERENCES users (id),
	characterId integer NOT NULL REFERENCES characters (id),
	value integer NOT NULL DEFAULT 0,
	UNIQUE (tournamentId, userId, characterId)
);


CREATE TABLE IF NOT EXISTS charactersData (
	id serial NOT NULL PRIMARY KEY,
	userId integer NOT NULL REFERENCES users (id),
	characterId integer NOT NULL REFERENCES characters (id),
	wins integer NOT NULL DEFAULT 0,
	losses integer NOT NULL DEFAULT 0,
	globalBestStreak integer NOT NULL DEFAULT 0,
	fireWins integer NOT NULL DEFAULT 0,
	UNIQUE (userId, characterId)
);

CREATE TABLE IF NOT EXISTS tournamentCharacters (
	id serial NOT NULL PRIMARY KEY,
	tournamentId integer NOT NULL REFERENCES tournaments (id),
	userId integer NOT NULL REFERENCES users (id),
	characterId integer NOT NULL REFERENCES characters (id),
	value integer NOT NULL,
	wins integer NOT NULL DEFAULT 0,
	losses integer NOT NULL DEFAULT 0,
	curStreak integer NOT NULL DEFAULT 0,
	bestStreak integer NOT NULL DEFAULT 0,
	fireWins integer NOT NULL DEFAULT 0,
	UNIQUE (tournamentId, userId, characterId)
);

CREATE TABLE IF NOT EXISTS events (
	id serial NOT NULL PRIMARY KEY,
	description varchar(255) NOT NULL
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
	('power-stock-init'),
	('power-stock-incr'),
	('power-rematch'),
	('streak-points-incr'),
	('streak-points-adjust-opponent'),
	('character-adjustment');

CREATE TABLE IF NOT EXISTS history (
	id serial NOT NULL PRIMARY KEY,
	tournamentId integer NOT NULL REFERENCES tournaments (id),
	userId integer NOT NULL REFERENCES users (id),
	characterId integer NOT NULL REFERENCES characters (id),
	eventId integer NOT NULL REFERENCES events (id),
	value integer DEFAULT 0,
	delta integer DEFAULT 0,
	time timestamp DEFAULT now()
);

CREATE USER ki WITH PASSWORD '123456789FOOBARBAZ';
GRANT ALL PRIVILEGES ON DATABASE ki TO ki;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ki;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ki;
