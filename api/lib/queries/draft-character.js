import log from '../../logger';

export default function draftCharacterQuery (db, tournamentUuid, character, userUuid, cb) {
	// begin transaction
	db.query('BEGIN', () => {
		const tcSql = `
			INSERT INTO tournament_characters
				(tournament_uuid, character_uuid, user_uuid, value, raw_value)
			VALUES ($1, $2, $3,
				(SELECT value from seeds
				WHERE tournament_uuid = $4
					AND opponent_uuid = $5
					AND character_uuid = $6),
				(SELECT value from seeds
				WHERE tournament_uuid = $7
					AND opponent_uuid = $8
					AND character_uuid = $9)
			)
		`;
		const tcParams = [tournamentUuid, character.uuid, userUuid, tournamentUuid, userUuid, character.uuid, tournamentUuid, userUuid, character.uuid];
		db.query(tcSql, tcParams, (err, results) => {
			if (err) {
				log.error(err, { tcSql, tcParams });
				return rollback(db, err, cb);
			}

			const draftsSql = `
				INSERT INTO drafts
					(tournament_uuid, character_uuid, user_uuid, pick)
				VALUES ($1, $2, $3,
					(SELECT coalesce(MAX(pick), 0) FROM drafts
						WHERE tournament_uuid = $4
					) + 1
				)
			`;
			const draftsParams = [tournamentUuid, character.uuid, userUuid, tournamentUuid];

			db.query(draftsSql, draftsParams, (err, results) => {
				if (err) {
					log.error(err, {draftsSql, draftsParams});
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
	});
}

const rollback = (db, err, cb) => {
	db.query('ROLLBACK', () => {
		cb(err);
	});
};
