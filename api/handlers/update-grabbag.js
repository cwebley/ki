import r from '../reasons';
import config from '../config';
import getFullTournamentData from '../lib/util/get-full-tournament-data';
import updateGrabbagQuery from '../lib/queries/update-grabbag';

export default function updateGrabbagHandler (req, res) {
	if (!req.params.tournamentSlug) {
		return res.status(400).send(r.noSlugParam);
	}
	if (req.body.index === undefined || isNaN(req.body.index)) {
		return res.status(400).send(r.noGrabbagIndex);
	}
	if (!req.body.characterUuid) {
		return res.status(400).send(r.noGrabbagCharacterUuid);
	}

	getFullTournamentData(req.db, req.redis, {
		tournamentSlug: req.params.tournamentSlug,
		userUuid: req.user.uuid
	}, (err, tournament) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!tournament) {
			return res.status(404).send(r.tournamentNotFound);
		}

		updateGrabbagQuery(req.db, req.redis, {
			tournamentUuid: tournament.uuid,
			userUuid: req.user.uuid,
			grabbagIndex: req.body.index,
			grabbagCharacterUuid: req.body.characterUuid
		}, (err, results) => {
			if (err) {
				return res.status(500).send(r.internal);
			}
			if (!results) {
				return res.status(400).send(r.grabbagChoiceInvalid);
			}

			return res.status(200).send({
				grabbag: results.grabbag,
				upcomingMatch: results.upcomingMatch
			});
		});
	});
}
