import log from '../../logger';

export default function draftCharacterQuery (db, tournamentUuid, characterUuid, userUuid, cb) {
	// begin transaction
	db.query('BEGIN', () => {

		const sql = `
			INSERT INTO tournament_characters
				(tournament_uuid, character_uuid, user_uuid, value)
			VALUES ($1, $2, $3,
				(SELECT value from seeds
				WHERE tournament_uuid = $4
					AND user_uuid = $5
					AND character_uuid = $6)
			)
		`;
		const params = [tournamentUuid, characterUuid, userUuid, tournamentUuid, characterUuid, userUuid];
		db.query(sql, params, (err, results) => {
			console.log("ERR, ", err, " RES: ", results);
			if (err) {
				log.error(err, { sql, params });
				return rollback(db, err, cb);
			}
			// return rollback(db, err, cb);
			// TODO delete row from draft characters and stuff
			// db.query('COMMIT', () => {
			// 	return cb(null, results);
			// });
		});
	});
}

const rollback = (db, err, cb) => {
	db.query('ROLLBACK', () => {
		cb(err);
	});
}
