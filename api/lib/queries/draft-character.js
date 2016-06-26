import log from '../../logger';

export default function draftCharacterQuery (db, tournamentUuid, character, userUuid, cb) {
	// begin transaction
	db.query('BEGIN', () => {

		const tcSql = `
			INSERT INTO tournament_characters
				(tournament_uuid, character_uuid, user_uuid, value)
			VALUES ($1, $2, $3,
				(SELECT value from seeds
				WHERE tournament_uuid = $4
					AND user_uuid = $5
					AND character_uuid = $6)
			)
		`;
		const tcParams = [tournamentUuid, character.uuid, userUuid, tournamentUuid, userUuid, character.uuid];
		db.query(tcSql, tcParams, (err, results) => {
			if (err) {
				log.error(err, { tcSql, tcParams });
				return rollback(db, err, cb);
			}

			const dcSql = `
				DELETE FROM draft_characters
				WHERE tournament_uuid = $1
					AND character_uuid = $2
			`;
			const dcParams = [tournamentUuid, character.uuid];
			db.query(dcSql, dcParams, (err, results) => {
				if (err) {
					log.error(err, {dcSql, dcParams});
					return rollback(db, err, cb);
				}
				db.query('COMMIT', () => {
					return cb(null, results);
				});
			});
		});
	});
}

const rollback = (db, err, cb) => {
	db.query('ROLLBACK', () => {
		cb(err);
	});
}
