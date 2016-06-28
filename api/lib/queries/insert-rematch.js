import log from '../../logger';

export default function insertRematch (db, tournamentUuid, game, userUuid, cb) {
	let userCharacterUuid;
	let opponentUuid;
	let opponentCharacterUuid;
	if (game.winner.uuid === userUuid) {
		userCharacterUuid = game.winner.characterUuid;
		opponentUuid = game.loser.uuid;
		opponentCharacterUuid = game.loser.characterUuid;
	}
	else {
		userCharacterUuid = game.loser.characterUuid;
		opponentUuid = game.winner.uuid;
		opponentCharacterUuid = game.winner.characterUuid;
	}
	const sql = `
		INSERT INTO rematch_games
			(game_uuid, tournament_uuid, user_uuid, user_character_uuid,
				opponent_uuid, opponent_character_uuid)
		VALUES ($1, $2, $3, $4, $5, $6)
	`;
	const params = [game.uuid, tournamentUuid, userUuid, userCharacterUuid, opponentUuid, opponentCharacterUuid];

	db.query(sql, params, (err, result) => {
		if (err) {
			log.error(err, { sql, params });
			return cb(err);
		}
		return cb(null, result);
	});
}
