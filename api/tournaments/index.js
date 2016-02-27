import r from '../reasons';
import config from '../config';
import { createTournament } from './model';

function createTournamentCtrl (req, res) {
	let opts = {
		name: req.body.name,
		goal: parseInt(req.body.goal, 10)
	}

	let problems = [];
	if (!opts.name) {
		problems.push(r.NoName);
	}
	if (!opts.goal) {
		problems.push(r.NoGoal);
	}
	if (problems.length) {
		return res.status(400).send(r(...problems));
	}

	if (opts.name.length > 25) {
		problems.push(r.InvalidName);
	}
	if (opts.goal < 1) {
		problems.push(r.InvalidGoal);
	}
	if (problems.length) {
		return res.status(400).send(r(...problems));
	}
	createTournament(opts, (err, tournament) => {
		if (err) {
			if (err.message.slice(0, 9) === 'duplicate') {
				return res.status(409).send(r.duplicateTournamentName);
			}
			return res.status(500).send(r.internal);
		}
		return res.status(201).send(tournament);
	});
}

export { createTournamentCtrl };
