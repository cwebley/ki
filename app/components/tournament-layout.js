import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import fetchTournament from '../actions/fetch-tournament';

import { getTournamentFromState, getMe } from '../store';

class TournamentLayout extends Component {
	componentDidMount () {
		this.props.fetchTournament(this.props.params.tournamentSlug, this.props.me.token);
	}

	render () {
		console.log("PROPS: ", this.props)
		return (
				<div>
					CHARACTERS AND STUFF
					<div>
						{ this.props.children }
					</div>
				</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	console.log("OP: ", ownProps)
	return {
		tournament: getTournamentFromState(ownProps.params.tournamentSlug),
		me: getMe(state),
	}
}

export default connect(mapStateToProps, { fetchTournament })(TournamentLayout);
