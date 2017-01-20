import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import fetchTournamentStats from '../actions/fetch-tournament-stats';
import { getMe, getTournamentStatsFromState } from '../store';

class TournamentStats extends Component {
	static displayName = 'tournamentStats';

	static propTypes = {
		stats: PropTypes.object,
		me: PropTypes.object
	};

	componentDidMount () {
		console.log('TS COMPONENT MOUNT');
		this.props.fetchTournamentStats(this.props.params.tournamentSlug, this.props.me.token);
	}

	render () {
		console.log('PROPS: ', this.props);
		return (
			<div className="page">
				<h1>Tournament Stats</h1>
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	stats: getTournamentStatsFromState(state, ownProps.params.tournamentSlug),
	me: getMe(state)
});

export default connect(mapStateToProps, { fetchTournamentStats })(TournamentStats);
