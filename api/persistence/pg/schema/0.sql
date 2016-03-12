CREATE TABLE IF NOT EXISTS characters (
	uuid char(36) NOT NULL PRIMARY KEY,
	name varchar(255) NOT NULL UNIQUE,
	slug varchar(255) NOT NULL UNIQUE,
	season integer NOT NULL
);

-- -- N/A character to satisfy `history` foreign key edgecases where the character is not important
-- INSERT INTO characters (name) VALUES
-- 	('NA')
-- ;

CREATE TABLE IF NOT EXISTS users (
	uuid char(36) NOT NULL,
	name varchar(255) NOT NULL UNIQUE,
	slug varchar(255) NOT NULL UNIQUE,
	password varchar(255) NOT NULL,
	email varchar(255),
	tournament_streak integer NOT NULL DEFAULT 0,
	tournament_best_streak integer NOT NULL DEFAULT 0,
	streak integer NOT NULL DEFAULT 0,
	best_streak integer NOT NULL DEFAULT 0,
	PRIMARY KEY (uuid)
);

CREATE TABLE IF NOT EXISTS tournaments (
	uuid char(36) NOT NULL,
	name varchar(255) NOT NULL UNIQUE,
	slug varchar(255) NOT NULL UNIQUE,
	goal integer NOT NULL,
	champion_uuid char(36) REFERENCES users (uuid),
	time timestamp DEFAULT now(),
	PRIMARY KEY (uuid)
);

CREATE TABLE IF NOT EXISTS tournament_users (
	tournament_uuid char(36) NOT NULL REFERENCES tournaments (uuid),
	user_uuid char(36) NOT NULL REFERENCES users (uuid),
	wins integer NOT NULL DEFAULT 0,
	losses integer NOT NULL DEFAULT 0,
	streak integer NOT NULL DEFAULT 0,
	best_streak integer NOT NULL DEFAULT 0,
	score integer NOT NULL DEFAULT 0,
	coins integer NOT NULL DEFAULT 0,
	PRIMARY KEY (tournament_uuid, user_uuid)
);

CREATE TABLE IF NOT EXISTS user_characters (
	user_uuid char(36) NOT NULL REFERENCES users (uuid),
	character_uuid char(36) NOT NULL REFERENCES characters (uuid),
	streak integer NOT NULL DEFAULT 0,
	best_streak integer NOT NULL DEFAULT 0,
	PRIMARY KEY (user_uuid, character_uuid)
);

CREATE TABLE IF NOT EXISTS games (
	id serial NOT NULL PRIMARY KEY,
	winning_player_uuid char(36) NOT NULL REFERENCES users (uuid),
	winning_character_uuid char(36) NOT NULL REFERENCES characters (uuid),
	losing_player_uuid char(36) NOT NULL REFERENCES users (uuid),
	losing_character_uuid char(36) NOT NULL REFERENCES characters (uuid),
	value integer DEFAULT 0,
	-- submitting a game wipes a winning streak to -1, need to keep these streaks around for undos and stuff
	losing_player_previous_streak integer NOT NULL DEFAULT 0,
	losing_character_previous_streak integer NOT NULL DEFAULT 0,
	tournament_uuid char(36) NOT NULL REFERENCES tournaments (uuid),
	supreme boolean DEFAULT false,
	time timestamp DEFAULT now()
);
--
-- CREATE TABLE IF NOT EXISTS seeds (
-- 	id serial NOT NULL PRIMARY KEY,
-- 	tournamentId integer NOT NULL REFERENCES tournaments (id),
-- 	userId integer NOT NULL REFERENCES users (id),
-- 	characterId integer NOT NULL REFERENCES characters (id),
-- 	value integer NOT NULL DEFAULT 0,
-- 	UNIQUE (tournamentId, userId, characterId)
-- );
--
--
-- CREATE TABLE IF NOT EXISTS charactersData (
-- 	id serial NOT NULL PRIMARY KEY,
-- 	userId integer NOT NULL REFERENCES users (id),
-- 	characterId integer NOT NULL REFERENCES characters (id),
-- 	wins integer NOT NULL DEFAULT 0,
-- 	losses integer NOT NULL DEFAULT 0,
-- 	globalBestStreak integer NOT NULL DEFAULT 0,
-- 	fireWins integer NOT NULL DEFAULT 0,
-- 	UNIQUE (userId, characterId)
-- );
--
CREATE TABLE IF NOT EXISTS tournament_characters (
	tournament_uuid char(36) NOT NULL REFERENCES tournaments (uuid),
	user_uuid char(36) NOT NULL REFERENCES users (uuid),
	character_uuid char(36) NOT NULL REFERENCES characters (uuid),
	value integer NOT NULL DEFAULT 0,
	wins integer NOT NULL DEFAULT 0,
	losses integer NOT NULL DEFAULT 0,
	streak integer NOT NULL DEFAULT 0,
	best_streak integer NOT NULL DEFAULT 0,
	fire_wins integer NOT NULL DEFAULT 0,
	PRIMARY KEY (tournament_uuid, user_uuid, character_uuid)
);

-- CREATE TABLE IF NOT EXISTS tournament_coins (
-- 	tournament_uuid char(36) NOT NULL REFERENCES tournaments (uuid),
-- 	user_uuid char(36) NOT NULL REFERENCES users (uuid),
-- 	stock integer NOT NULL DEFAULT 0,
-- 	PRIMARY KEY (tournament_uuid, user_uuid)
-- );
--
-- CREATE TABLE IF NOT EXISTS events (
-- 	id serial NOT NULL PRIMARY KEY,
-- 	description varchar(255) NOT NULL
-- );
--
-- INSERT INTO events (description) VALUES
-- 	('seeding'),
-- 	('game'),
-- 	('fire'),
-- 	('friendlyFire'),
-- 	('ice'),
-- 	('friendlyIce'),
-- 	('power-reseed'),
-- 	('power-deduct-points'),
-- 	('power-deduct-exipres'),
-- 	('power-oddsMaker'),
-- 	('power-inspect'),
-- 	('power-stock-init'),
-- 	('power-stock-incr'),
-- 	('power-rematch'),
-- 	('streak-points-incr'),
-- 	('streak-points-adjust-opponent'),
-- 	('character-adjustment');
--
-- CREATE TABLE IF NOT EXISTS history (
-- 	id serial NOT NULL PRIMARY KEY,
-- 	tournamentId integer NOT NULL REFERENCES tournaments (id),
-- 	userId integer NOT NULL REFERENCES users (id),
-- 	characterId integer NOT NULL REFERENCES characters (id),
-- 	eventId integer NOT NULL REFERENCES events (id),
-- 	value integer DEFAULT 0,
-- 	delta integer DEFAULT 0,
-- 	time timestamp DEFAULT now()
-- );

CREATE USER ki WITH PASSWORD '123456789FOOBARBAZ';
GRANT ALL PRIVILEGES ON DATABASE ki TO ki;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ki;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ki;
