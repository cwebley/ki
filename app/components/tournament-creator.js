import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import ReasonsList from './reasons-list';

/*
	Example form data for /api/tournaments
	// tournament rules
	{ name: 'sibyl.org', goal: 231, opponentSlug: 'Orlo-Johnston', startCoins: 10 }

	// character settings
	{ opponentCharacters: ['kan-ra', 'aganos', 'jago'], myCharacters: ['aganos', 'gargos', 'arbiter'] }
		** OPTIONAL and these can be repeats between users**
	{ characterCountPerUser: 8 }
		**Minimum number is the user with the most characters above**
		**Maximum number allCharacters.length
	{ highestValueStart: 16 }
		**(characters in this case will start at be 2, 4, 6, 8, 10, 12, 14, 16 points)**
	{ draftCharacters: ['spinal', fulgore', 'tj-combo', 'maya', 'hisako', 'glacius', 'tusk', 'riptor', 'thunder', 'mira'] }
		**REQUIRED unless user characters exist and their lengths are the same
		**xters here cant be in the user-characters lists**
		** must have enough characters to satisfy the character count per user
*/

class TournamentCreator extends Component {
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
