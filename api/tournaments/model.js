import slug from 'slug';
import uuid from 'node-uuid';

import log from '../logger';
import { query } from '../persistence/pg';

// returns a tournament object
function createTournament (opts, cb) {
	const tournamentSlug = slug(opts.name);
	const tournamentUuid = uuid.v4();

	const sql = 'INSERT INTO tournaments (uuid, name, slug, goal) VALUES ($1, $2, $3, $4)';
	const params = [tournamentUuid, opts.name, tournamentSlug, opts.goal];

	query(sql, params, (err, results) => {
		return cb(err, {
			uuid: tournamentUuid,
			name: opts.name,
			slug: tournamentSlug,
			goal: opts.goal
		});
	});
}

export { createTournament };
