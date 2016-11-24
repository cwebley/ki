import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import fetchTournamentIndex from '../actions/fetch-tournament-index';
import { getMe, getTournamentIndexFromState } from '../store';

class TournamentIndex extends Component {
	static displayName = 'tournamentIndex';

	static propTypes = {
		tournaments: PropTypes.array
	};

	static defaultProps = {
		tournaments: []
	};

	static contextTypes = {
		router: PropTypes.object.isRequired
	};

	componentDidMount () {
		this.props.fetchTournamentIndex(this.props.me.token);
	}

	render () {
		console.log("TI")
		return (
			<div className="page">
				<h1>Tournament Index</h1>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	tournaments: getTournamentIndexFromState(state),
	me: getMe(state)
});

export default connect(mapStateToProps, {fetchTournamentIndex})(TournamentIndex);
