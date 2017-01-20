import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import purchaseGrabbag from '../actions/purchase-grabbag';
import useGrabbagCharacter from '../actions/use-grabbag-character';
import { getMe, getTournamentActiveFromState, getFirstUserCoinsFromState, getFirstUserGrabbagFromState, getFirstUserCharactersFromState } from '../store';
import Grabbag from '../components/grabbag';

class GrabbagContainer extends Component {
	constructor (props) {
		super(props);
		this.handlePurchaseGrabbag = this.handlePurchaseGrabbag.bind(this);
		this.handleUseGrabbagCharacter = this.handleUseGrabbagCharacter.bind(this);
	}

	static displayName = 'GrabbagContainer';

	static propTypes = {
		// from parent component
		tournamentSlug: PropTypes.string.isRequired
	};

	handlePurchaseGrabbag () {
		this.props.purchaseGrabbag(this.props.tournamentSlug, this.props.me.token);
	}

	handleUseGrabbagCharacter (index, characterUuid) {
		console.log("USE GRABBAG CHARACTER: ", index, characterUuid);
		this.props.useGrabbagCharacter(this.props.tournamentSlug, {
			index,
			characterUuid
		}, this.props.me.token);
	}

	render () {
		return (
			<Grabbag
				onPurchaseGrabbag={this.handlePurchaseGrabbag}
				onUseGrabbagCharacter={this.handleUseGrabbagCharacter}
				coins={this.props.coins}
				grabbag={this.props.grabbag}
				tournamentActive={this.props.tournamentActive}
				characterList={this.props.characterList}
			/>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	me: getMe(state),
	tournamentActive: getTournamentActiveFromState(state, ownProps.tournamentSlug),
	coins: getFirstUserCoinsFromState(state, ownProps.tournamentSlug),
	grabbag: getFirstUserGrabbagFromState(state, ownProps.tournamentSlug),
	characterList: getFirstUserCharactersFromState(state, ownProps.tournamentSlug)
});

export default connect(mapStateToProps, { purchaseGrabbag, useGrabbagCharacter })(GrabbagContainer);
