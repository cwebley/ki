import log from '../../logger';
import config from '../../config';
import decrementCoins from './decrement-coins';

export default function decrementQuery (db, opts, cb) {
	db.query('BEGIN', () => {
		const sql = `
			UPDATE tournament_characters
			SET value = value - 1, raw_value = raw_value - 1
			WHERE tournament_uuid = $1
				AND user_uuid = $2
				AND character_uuid = $3
		`;
		const params = [opts.tournamentUuid, opts.opponentUuid, opts.characterUuid];

		db.query(sql, params, (err, results) => {
			if (err) {
				log.error(err, { sql, params });
				return rollback(db, err, cb);
			}
			decrementCoins(db, opts.tournamentUuid, opts.userUuid, opts.cost, (err, results) => {
				if (err) {
					// already logged
					return rollback(db, err, cb);
				}
				db.query('COMMIT', cb(null, results))
			});
		});
	});
}

function rollback (db, err, cb) {
	db.query('ROLLBACK', () => {
		cb(err);
	});
}
