import r from '../reasons';
import slug from 'slug';
import uuid from 'node-uuid';
import createTournamentQuery from '../lib/queries/create-tournament';
import getUserQuery from '../lib/queries/get-user';

export default function createTournamentHandler (req, res) {
	let tournamentOpts = {
		tournamentName: req.body.name,
		tournamentGoal: parseInt(req.body.goal, 10)
	}

	let problems = [];
	if (!tournamentOpts.tournamentName) {
		problems.push(r.NoName);
	}
	if (!req.body.opponentSlug) {
		problems.push(r.NoOpponentSlug);
	}
	if (!tournamentOpts.tournamentGoal) {
		problems.push(r.NoGoal);
	}
	if (problems.length) {
		return res.status(400).send(r(...problems));
	}

	if (tournamentOpts.tournamentName.length > 25) {
		problems.push(r.InvalidName);
	}
	if (tournamentOpts.tournamentGoal < 1) {
		problems.push(r.InvalidGoal);
	}
	if (problems.length) {
		return res.status(400).send(r(...problems));
	}

	// fetch opponent data
	getUserQuery(req.db, 'slug', req.body.opponentSlug, (err, opponentData) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!opponentData) {
			return res.status(400).send(r.InvalidOpponentSlug);
		}

		tournamentOpts.tournamentUuid = uuid.v4();
		tournamentOpts.tournamentSlug = slug(tournamentOpts.tournamentName);
		tournamentOpts.opponentUuid = opponentData.uuid;
		tournamentOpts.userUuid = req.user.uuid;

		console.log("OPTS: ", tournamentOpts);

		createTournamentQuery(req.db, tournamentOpts, (err, tournament) => {
			if (err) {
				if (err.message.slice(0, 9) === 'duplicate') {
					return res.status(409).send(r.duplicateTournamentName);
				}
				return res.status(500).send(r.internal);
			}
			return res.status(201).send(tournament);
		});
	});

}
