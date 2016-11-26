import r from '../reasons';
import getTournamentList from '../lib/queries/get-tournament-list';

export default function getTournamentListQuery (req, res) {
	getTournamentList(req.db, req.redis, {
		userUuid: req.user && req.user.uuid
	}, (err, tournamentListData) => {
		if (err) {
			return res.status(500).send(r.internal);
		}

		return res.status(200).send(tournamentListData);
	});
}
