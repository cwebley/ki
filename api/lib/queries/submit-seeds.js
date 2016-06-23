import async from 'neo-async';
import log from '../../logger';

export default function submitSeedsQuery (db, opts, cb) {
	if (
		!opts || !opts.tournamentUuid
		|| !opts.seeds || !opts.maxStartingValue
		|| !opts.opponentUuid || !opts.userUuid
		|| !opts.opponentCharacters
	) {
		return cb(new Error('invalid opts passed to submitSeedsQuery'));
	}

	// begin transaction
	db.query('BEGIN', () => {

		let seedsValues = [];
		let seedsParams = [];

		let tcUpdateQueries = [];

		opts.seeds.forEach((cUuid, i) => {
			const seedValue = getSeedValue(i, opts.seeds.length, opts.maxStartingValue);

			seedsValues.push(`($${5 * i + 1}, $${5 * i + 2}, $${5 * i + 3}, $${5 * i + 4}, $${5 * i + 5})`);
			seedsParams.push(opts.tournamentUuid, opts.userUuid, opts.opponentUuid, cUuid, seedValue);

			// if this character is not part of the draft, we can add their value to the db right now
			// assemble update queries for each of these characters then execute in parallel
			if (opts.opponentCharacters[cUuid]) {
				tcUpdateQueries.push(done => {
					const tcSql = `
						UPDATE tournament_characters
						SET value = $1
						WHERE tournament_uuid = $2
							AND user_uuid = $3
							AND character_uuid = $4
					`;
					const tcParams = [seedValue, opts.tournamentUuid, opts.opponentUuid, cUuid];
					db.query(tcSql, tcParams, (err, results) => {
						if (err) {
							log.error(err, { sql, params });
						}
						done(err, results);
					});
				});
			}
		});

		const seedsSql = `
			INSERT INTO seeds
				(tournament_uuid, user_uuid, opponent_uuid, character_uuid, value)
			VALUES ${seedsValues.join(', ')}
		`;

		db.query(seedsSql, seedsParams, (err, results) => {
			if (err) {
				log.error(err, {seedsSql, seedsParams});
				return rollback(db, err, cb);
			}

			async.parallel(tcUpdateQueries, (err, results) => {
				if (err) {
					return rollback(db, err, cb);
				}

				// update the `seeded` field of tournament_users
				const tuSql = `
					UPDATE tournament_users
						SET seeded = $1
						WHERE tournament_uuid = $2
						AND user_uuid = $3
				`;
				const tuParams = [true, opts.tournamentUuid, opts.userUuid];

				db.query(tuSql, tuParams, (err, results) => {
					if (err) {
						return rollback(db, err, cb);
					}
					// end transaction
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
}

const getSeedValue = (index, length, maxStartingValue) =>
	Math.floor((index * maxStartingValue) / length) + 1;
