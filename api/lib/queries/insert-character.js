import { query } from '../../persistence/pg';

// returns a character object if successful
export default function insertCharacterQuery (uuid, name, slug, season, cb) {
	const sql = `
					INSERT INTO characters
						(uuid, name, slug, season)
					VALUES
						($1, $2, $3, $4)
				`;
	const params = [uuid, name, slug, season];

	query(sql, params, (err, results) => {
		return cb(err, { uuid, name, slug, season });
	});
}
