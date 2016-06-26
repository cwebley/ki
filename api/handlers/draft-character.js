import log from '../logger';
import r from '../reasons';

import getTournament from '../lib/queries/get-tournament';
import getTournamentUser from '../lib/queries/get-tournament-user';
import getCharacter from '../lib/queries/get-character';
import draftCharacterQuery from '../lib/queries/draft-character';
import updateDraftStatus from '../lib/queries/update-draft-status';

export default function draftCharacterHandler (req, res) {
	if (!req.params.tournamentSlug) {
		return res.status(400).send(r.noSlugParam);
	}

	if (!req.body || !req.body.pick) {
		res.status(400).send(r.noPick);
	}

	getTournament(req.db, 'slug', req.params.tournamentSlug, (err, tournament) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!tournament) {
			return res.status(404).send(r.tournamentNotFound);
		}

		getTournamentUser(req.db, tournament.uuid, req.user.uuid, (err, user) => {
			if (err) {
				return res.status(500).send(r.internal);
			}
			if (!user) {
				return res.status(404).send(r.tournamentUserNotFound);
			}
			// if it's not the current user's turn, return error message
			if (!user.drafting) {
				return res.status(400).send(r.notDrafting);
			}

			getCharacter(req.db, 'slug', req.body.pick, (err, character) => {
				if (err) {
					return res.status(500).send(r.internal);
				}
				if (!character) {
					return res.status(400).send(r.draftPickNotFound);
				}

				draftCharacterQuery(req.db, tournament.uuid, character, req.user.uuid, (err, results) => {
					if (err) {
						return res.status(500).send(r.internal);
					}

					updateDraftStatus(req.db, tournament.uuid, (err, draftStatus) => {
						if (err) {
							return res.status(500).send(r.internal);
						}
						return res.status(200).send({
							...draftStatus,
							pick: {
								...character
							}
						});
					});
				});
			});

		});
	});
}
