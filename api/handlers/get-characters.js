import r from '../reasons';
import getCharactersQuery from '../lib/queries/get-characters';

export default function getCharactersHandler (req, res) {
	getCharactersQuery(req.db, (err, characters) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		return res.status(201).send(characters);
	});
}
