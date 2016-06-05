import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import ReasonsList from './reasons-list';

/*
	Example form data for /api/tournaments
	{ name: 'sibyl.org', goal: 231, opponentSlug: 'Orlo-Johnston', startCoins: 10 }

	// more stuff
	{ opponentCharacters: ['kan-ra', 'orchid', 'jago'], myCharacters: ['aganos', 'gargos', 'arbiter'] }
	{ characterCountPerUser: 8 }
	{ highestValueStart: 16 } **(characters in this case will start at be 2, 4, 6, 8, 10, 12, 14, 16 points)**
	{ draftCharacters: ['spinal', fulgore', 'tj-combo', 'maya', 'hisako', 'glacius', 'tusk'] } **OPTIONAL**
*/

export default class TournamentCreator extends Component {
	static displayName = 'tournamentCreator'

	static propTypes = {
		reasons: PropTypes.array,
		characters: PropTypes.array
	}

	render () {
		return (
			<div className="page">
				<h1>Create a Tournament</h1>
				<ReasonsList reasons={this.props.reasons} />
			</div>
		);
	}

	onSubmit (data) {

	}
}


const mapStateToProps = (state) => ({
	reasons: []
});

export default connect(mapStateToProps)(TournamentCreator);
