import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import ReasonsList from './reasons-list';

export default class TournamentCreator extends Component {
	static displayName = 'tournamentCreator'

	static propTypes = {
	}

	render () {
		return (
			<div className="page">
				<h1>TournamentCreator</h1>
				<ReasonsList reasons={this.props.reasons} />
			</div>
		);
	}

	onSubmit (data) {
		this.props.signInUser(data, formName)
			// redirect to the home page if login was successful
			.then(
				action => {
					if (action.token) {
						this.context.router.push('/')
					}
				}
			);
	}
}


const mapStateToProps = (state) => ({
	reasons: []
});

export default connect(mapStateToProps)(TournamentCreator);
