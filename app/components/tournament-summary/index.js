import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { containerClass, championNameClass } from './styles.css';

export default function TournamentSummary ({ championName, tournamentSlug }) {
	return (
		<div className={containerClass}>
			<h3>
				<strong className={championNameClass}>{championName}</strong>
				<span> is the champion!</span>
			</h3>
			<Link to={`/tournament/${tournamentSlug}/stats`}>
				<span>See Stats</span>
			</Link>
		</div>
	);
}

TournamentSummary.propTypes = {
	championName: PropTypes.string.isRequired,
	tournamentSlug: PropTypes.string.isRequired
};
