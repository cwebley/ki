import r from '../reasons';
import config from '../config';
import slug from 'slug';
import uuid from 'node-uuid';
import insertCharacterQuery from '../lib/queries/insert-character';

export default function createCharacter (req, res) {
	let opts = {
		name: req.body.name,
		season: parseInt(req.body.season, 10)
	}

	let problems = [];
	if (!opts.name) {
		problems.push(r.NoName);
	}
	if (!opts.season) {
		problems.push(r.NoSeason);
	}
	if (problems.length) {
		return res.status(400).send(r(...problems));
	}

	if (opts.name.length > 25) {
		problems.push(r.InvalidName);
	}
	if (opts.season < 1) {
		problems.push(r.InvalidSeason);
	}
	if (problems.length) {
		return res.status(400).send(r(...problems));
	}

	const characterUuid = uuid.v4();
	const characterSlug = slug(opts.name);

	insertCharacterQuery(characterUuid, opts.name, characterSlug, opts.season, (err, character) => {
		if (err) {
			if (err.message.slice(0, 9) === 'duplicate') {
				return res.status(409).send(r.duplicateCharacterName);
			}
			return res.status(500).send(r.internal);
		}
		return res.status(201).send(character);
	});
}
