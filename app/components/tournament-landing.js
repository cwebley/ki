import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import fetchTournament from '../actions/fetch-tournament';
import updateSeeds from '../actions/update-seeds';
import submitSeeds from '../actions/submit-seeds';

import { getTournamentFromState, getMe } from '../store';
import get from 'lodash.get';

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

import SeedContainer from './seed-container';

const styles = {
	pageStyle: {
		textAlign: 'center'
	},
	characterListStyle: {
		margin: 0,
		padding: 0,
		listStyleType: 'none',
	},
	leftUserStyle: {
		float: 'left',
		width: '33%'
	},
	rightUserStyle: {
		float: 'right',
		width: '33%'
	},
	centerColStyle: {
		float: 'left',
		width: '34%'
	}
}

class TournamentLanding extends Component {
	constructor(props) {
		super(props);
		this.updateSeeds = this.updateSeeds.bind(this);
	}

	static propTypes = {
		me: PropTypes.object,
		tournament: PropTypes.object.isRequired,
		fetchTournament:PropTypes.func.isRequired,
		updateSeeds:PropTypes.func.isRequired
	};

	componentDidMount () {
		this.props.fetchTournament(this.props.params.tournamentSlug, this.props.me.token)
			// if f
			.then(() => {
				if (!this.props.tournament.users) {
					return;
				}
				let stillSeeding = false;
				this.props.tournament.users.result.forEach(uuid => {
					if (!this.props.tournament.users.ids[uuid].seeded) {
						stillSeeding = true;
					}
				});
				if (!stillSeeding) {
					return;
				}
				const opponent = this.props.tournament.users.ids[this.props.tournament.users.result[1]];
				const opponentCharacters = opponent.characters.result.map(uuid => opponent.characters.ids[uuid]);
				const draftCharacters = this.props.tournament.draft.result.map(uuid => this.props.tournament.draft.ids[uuid]);
				this.props.updateSeeds(this.props.tournament.slug, [...opponentCharacters, ...draftCharacters]);
			});
	}

	render () {
		console.log("T: ", this.props.tournament)
		if (!this.props.tournament.users) {
			return (
				<div>Tournament loading...</div>
			);
		}

		const hydratedUsers = this.props.tournament.users.result.map(uuid => this.props.tournament.users.ids[uuid]);
		let stillSeeding = false;
		hydratedUsers.forEach(u => {
			if (!u.seeded) {
				stillSeeding = true;
			}
		});

		return (
				<div style={styles.pageStyle}>
					{this.renderLeftUser(hydratedUsers[0])}
					{this.renderCenter(stillSeeding)}
					{this.renderRightUser(hydratedUsers[1], this.props.tournament.draft)}
					<div>
						{ this.props.children }
					</div>
				</div>
		);
	}

	renderLeftUser (user) {
		console.log("LEFT USER : ", user);
		const characters = user.characters.result.map(uuid => user.characters.ids[uuid]);
		return (
			<div style={styles.leftUserStyle}>
				LEFT USER
				<div>{user.name}</div>
				<ol style={styles.characterListStyle}>
					{characters.map(c => this.renderCharacter(c))}
				</ol>
			</div>
		);
	}

	renderCenter (stillSeeding) {
		return (
			<div style={styles.centerColStyle}>
				CHARACTERS AND STUFF
				{stillSeeding && <RaisedButton
					label="Submit Seeds"
					primary={true}
					onTouchTap={() => this.submitSeeds()}
				/>}
			</div>
		);
	}

	renderRightUser (user, draftCharacters) {
		console.log("R*GHT USER : ", user, draftCharacters);
		if (!user.seeded) {
			return this.renderDraggableSeeds(user, draftCharacters)
		}
		const characters = user.characters.result.map(uuid => user.characters.ids[uuid]);
		return (
			<div style={styles.rightUserStyle}>
				RIGHT USER
				<div>{user.name}</div>
				<ol style={styles.characterListStyle}>
					{characters.map(c => this.renderCharacter(c))}
				</ol>
			</div>
		);
	}

	renderDraggableSeeds (user, draftCharacters) {
		let characters;
		let draft;
		let seedCharacters;
		if (!this.props.tournament.seedCharacters) {
			characters = user.characters.result.map(uuid => user.characters.ids[uuid]);
			draft = draftCharacters.result.map(uuid => draftCharacters.ids[uuid]);
			seedCharacters = [...characters, ...draft];
		}
		else {
			seedCharacters = this.props.tournament.seedCharacters
		}
		return (
			<div style={styles.rightUserStyle}>
				RIGHT USER
				<div>{user.name}</div>
				<SeedContainer
					characters={seedCharacters}
					maxStartingValue={this.props.tournament.maxStartingValue}
					updateSeeds={this.updateSeeds}
				/>
			</div>
		);
	}

	// LEFT COL USER INFO AND CHARS

	// MIDDLE:
		// Powerup buttons and stuff
		// draft characters // just a click button
		// little inspect cards with streaks and values // draggable obvs


	// RIGHT COL USER INFO AND CHARS // not draggable
		// maybe seeding for your opponent? //draggable


	renderCharacter (character) {
		let streakText = '';
		if (character.streak > 0) {
			streakText = this.props.streak + 'W';
		}
		if (character.streak < 0) {
			streakText = -1 * this.props.streak + 'L';
		}
		return (
			<li key={character.uuid}>
				<Paper>
					<div>
						{character.value || '?'}
					</div>
					<div>
						<h4>{character.name}</h4>
						<div>{character.wins} - {character.losses}</div>
					</div>
					<div>
						{streakText}
					</div>
				</Paper>
			</li>
		);
	}

	updateSeeds(data) {
		this.props.updateSeeds(this.props.tournament.slug, data)
	}

	submitSeeds() {
		console.log("SS: ", this.props.tournament)
		this.props.submitSeeds(this.props.tournament.slug, this.props.tournament.seedValues, this.props.me.token);
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		tournament: getTournamentFromState(state, ownProps.params.tournamentSlug),
		me: getMe(state),
	}
}

export default connect(mapStateToProps, { fetchTournament, updateSeeds, submitSeeds })(TournamentLanding);
