CREATE TABLE IF NOT EXISTS characters (
	uuid char(36) NOT NULL PRIMARY KEY,
	name varchar(255) NOT NULL UNIQUE,
	slug varchar(255) NOT NULL UNIQUE,
	season integer NOT NULL
);

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
	active boolean NOT NULL DEFAULT false,
	characters_per_user integer NOT NULL,
	max_starting_value integer NOT NULL,
	champion_uuid char(36) REFERENCES users (uuid),
	time timestamp DEFAULT now(),
	PRIMARY KEY (uuid)
);

CREATE TABLE IF NOT EXISTS tournament_users (
	tournament_uuid char(36) NOT NULL REFERENCES tournaments (uuid),
	user_uuid char(36) NOT NULL REFERENCES users (uuid),
	seeded boolean NOT NULL DEFAULT false,
	drafting boolean NOT NULL DEFAULT false,
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

CREATE TABLE IF NOT EXISTS draft_characters (
	tournament_uuid char(36) NOT NULL REFERENCES tournaments (uuid),
	character_uuid char(36) NOT NULL REFERENCES characters (uuid),
	PRIMARY KEY (tournament_uuid, character_uuid)
);

CREATE TABLE IF NOT EXISTS drafts (
	tournament_uuid char(36) NOT NULL REFERENCES tournaments (uuid),
	user_uuid char(36) NOT NULL REFERENCES users (uuid),
	character_uuid char(36) NOT NULL REFERENCES characters (uuid),
	pick integer NOT NULL,
	PRIMARY KEY (tournament_uuid, character_uuid)
);

CREATE TABLE IF NOT EXISTS seeds (
	tournament_uuid char(36) NOT NULL REFERENCES tournaments (uuid),
	user_uuid char(36) NOT NULL REFERENCES users (uuid),
	opponent_uuid char(36) NOT NULL REFERENCES users (uuid),
	character_uuid char(36) NOT NULL REFERENCES characters (uuid),
 	value integer NOT NULL,
	PRIMARY KEY (tournament_uuid, user_uuid, character_uuid)
);

CREATE TABLE IF NOT EXISTS games (
	uuid char(36) NOT NULL,
	winning_player_uuid char(36) NOT NULL REFERENCES users (uuid),
	winning_character_uuid char(36) NOT NULL REFERENCES characters (uuid),
	losing_player_uuid char(36) NOT NULL REFERENCES users (uuid),
	losing_character_uuid char(36) NOT NULL REFERENCES characters (uuid),
	value integer DEFAULT 0,
	losing_character_previous_value integer DEFAULT 0,
	-- submitting a game wipes a winning streak to -1, need to keep these streaks around for undos and stuff
	losing_player_previous_streak integer NOT NULL DEFAULT 0,
	winning_player_previous_streak integer NOT NULL DEFAULT 0,
	losing_player_previous_global_streak integer NOT NULL DEFAULT 0,
	winning_player_previous_global_streak integer NOT NULL DEFAULT 0,
	losing_character_previous_streak integer NOT NULL DEFAULT 0,
	winning_character_previous_streak integer NOT NULL DEFAULT 0,
	losing_character_previous_global_streak integer NOT NULL DEFAULT 0,
	winning_character_previous_global_streak integer NOT NULL DEFAULT 0,
	tournament_uuid char(36) NOT NULL REFERENCES tournaments (uuid),
	supreme boolean DEFAULT false,
	time timestamp DEFAULT now(),
	PRIMARY KEY (uuid)
);

CREATE TABLE IF NOT EXISTS tournament_characters (
	tournament_uuid char(36) NOT NULL REFERENCES tournaments (uuid),
	user_uuid char(36) NOT NULL REFERENCES users (uuid),
	character_uuid char(36) NOT NULL REFERENCES characters (uuid),
	value integer, --never lower than 1
	raw_value integer, --can be lower than 1 if value is decr'd after a loss at 1 pt or friendly is iced while at 1pt
	wins integer NOT NULL DEFAULT 0,
	losses integer NOT NULL DEFAULT 0,
	streak integer NOT NULL DEFAULT 0,
	best_streak integer NOT NULL DEFAULT 0,
	fire_wins integer NOT NULL DEFAULT 0,
	PRIMARY KEY (tournament_uuid, user_uuid, character_uuid)
);

CREATE TABLE IF NOT EXISTS rematch_games (
	game_uuid char(36) NOT NULL REFERENCES games (uuid),
	tournament_uuid char(36) NOT NULL REFERENCES tournaments (uuid),
	user_uuid char(36) NOT NULL REFERENCES users (uuid),
	user_character_uuid char(36) NOT NULL REFERENCES characters(uuid),
	opponent_uuid char(36) NOT NULL REFERENCES users (uuid),
	opponent_character_uuid char(36) NOT NULL REFERENCES characters(uuid),
	success boolean,
	time timestamp DEFAULT now(),
	PRIMARY KEY (game_uuid)
);

CREATE TABLE IF NOT EXISTS oddsmaker (
	tournament_uuid char(36) NOT NULL REFERENCES tournaments (uuid),
	user_uuid char(36) NOT NULL REFERENCES users (uuid),
	user_character_uuid char(36) NOT NULL REFERENCES characters(uuid),
	opponent_uuid char(36) NOT NULL REFERENCES users (uuid),
	time timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspect_games (
	tournament_uuid char(36) NOT NULL REFERENCES tournaments (uuid),
	user_uuid char(36) NOT NULL REFERENCES users (uuid),
	opponent_uuid char(36) NOT NULL REFERENCES users (uuid),
	game_uuid char(36) NOT NULL REFERENCES games (uuid),
	time timestamp DEFAULT now(),
	PRIMARY KEY (game_uuid)
);

CREATE USER ki WITH PASSWORD '123456789FOOBARBAZ';
GRANT ALL PRIVILEGES ON DATABASE ki TO ki;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ki;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ki;
