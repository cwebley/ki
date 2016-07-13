import log from '../logger';
import r from '../reasons';

import getTournament from '../lib/queries/get-tournament';
import getTournamentUsers from '../lib/queries/get-tournament-users';
import getCharacter from '../lib/queries/get-character';
import getTournamentCharacterCount from '../lib/queries/get-tournament-character-count';
import draftCharacterQuery from '../lib/queries/draft-character';
import updateDraftStatus from '../lib/queries/update-draft-status';
import getDraftQuery from '../lib/queries/get-draft';

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

		getTournamentUsers(req.db, tournament.uuid, (err, tournamentUsers) => {
			if (err) {
				return res.status(500).send(r.internal);
			}

			// check if user in in the tournament
			let draftingUser;
			tournamentUsers.forEach((u, i) => {
				if (u.uuid === req.user.uuid) {
					draftingUser = u;
				}
			});
			if (!draftingUser) {
				return res.status(400).send(r.tournamentUserNotFound);
			}

			// if it's not the current user's turn, return error message
			if (!draftingUser.drafting) {
				return res.status(400).send(r.notDrafting);
			}

			getCharacter(req.db, 'slug', req.body.pick, (err, character) => {
				if (err) {
					return res.status(500).send(r.internal);
				}
				if (!character) {
					return res.status(400).send(r.draftPickNotFound);
				}

				getTournamentCharacterCount(req.db, tournament.uuid, req.user.uuid, (err, characterCount) => {
					if (err) {
						return res.status(500).send(r.internal);
					}
					if (characterCount >= tournament.charactersPerUser) {
						return res.status(400).send(r.draftInactive);
					}

					draftCharacterQuery(req.db, tournament.uuid, character, req.user.uuid, (err, results) => {
						if (err) {
							return res.status(500).send(r.internal);
						}

						updateDraftStatus(req.db, req.redis, tournament.uuid, (err, draftStatus) => {
							if (err) {
								return res.status(500).send(r.internal);
							}

							getDraftQuery(req.db, tournament.uuid, tournamentUsers.map(u => u.uuid), (err, draftData) => {
								if (err) {
									return res.status(500).send(r.internal);
								}

								return res.status(200).send({
									drafting: draftStatus.drafting,
									tournamentActive: draftStatus.tournamentActive,
									current: draftStatus.current,
									total: draftStatus.total,
									character: character,
									pick: draftData.previous.pick,
									value: draftData.previous.value
								});
							});
						});
					});
				});
			});
		});
	});
}
