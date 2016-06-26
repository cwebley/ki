import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import fetchTournament from '../actions/fetch-tournament';
import updateSeeds from '../actions/update-seeds';
import submitSeeds from '../actions/submit-seeds';
import draftCharacter from '../actions/draft-character';

import { getTournamentFromState, getMe } from '../store';
import get from 'lodash.get';

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

import SeedContainer from './seed-container';

import IconButton from 'material-ui/IconButton';
import AddCircleOutline from 'material-ui/svg-icons/content/add-circle-outline';
import { cyan500 } from 'material-ui/styles/colors';


const styles = {
	pageStyle: {
		textAlign: 'center'
	},
	characterListStyle: {
		margin: 0,
		padding: 0,
		listStyleType: 'none',
	},
	draftCharacters: {
		margin: 0,
		padding: '1em',
		listStyleType: 'none'
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
				let seedingInProgress = false;
				this.props.tournament.users.result.forEach(uuid => {
					if (!this.props.tournament.users.ids[uuid].seeded) {
						seedingInProgress = true;
					}
				});
				if (!seedingInProgress) {
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
		let seedingInProgress = false;
		let draftInProgress = false;
		hydratedUsers.forEach(u => {
			if (!u.seeded) {
				seedingInProgress = true;
			}
			if (u.drafting) {
				draftInProgress = true;
			}
		});

		return (
				<div style={styles.pageStyle}>
					{this.renderLeftUser(hydratedUsers[0])}
					{this.renderCenter(seedingInProgress, draftInProgress)}
					{this.renderRightUser(seedingInProgress)}
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

	renderCenter (seedingInProgress, draftInProgress) {
		return (
			<div style={styles.centerColStyle}>
				CHARACTERS AND STUFF
				{seedingInProgress && <RaisedButton
					label="Submit Seeds"
					primary={true}
					disabled={this.props.tournament.users.ids[this.props.tournament.users.result[0]].seeded}
					onTouchTap={() => this.submitSeeds()}
				/>}
				{draftInProgress && this.renderDraft()}
			</div>
		);
	}

	renderRightUser (seedingInProgress) {
		const { tournament } = this.props;
		const user = tournament.users.ids[tournament.users.result[1]];
		const userCharacters = user.characters.result.map(uuid => user.characters.ids[uuid]);
		const characters = user.characters.result.map(uuid => user.characters.ids[uuid]);
		return (
			<div style={styles.rightUserStyle}>
				RIGHT USER
				<div>{user.name}</div>
				{seedingInProgress && <SeedContainer
					characters={tournament.seedCharacters || []}
					maxStartingValue={tournament.maxStartingValue}
					updateSeeds={this.updateSeeds}
				/>}
				{!seedingInProgress && <ol style={styles.characterListStyle}>
					{characters.map(c => this.renderCharacter(c))}
				</ol>}
			</div>
		);
	}

	renderDraft () {
		const { tournament } = this.props;
		const draftCharacters = tournament.draft.result.map(cUuid => tournament.draft.ids[cUuid]);
		return (
			<div>
				Draft it up
				<ol style={styles.draftCharacters}>
					{draftCharacters.map(c => this.renderDraftCharacter(c))}
				</ol>
			</div>
		);
	}

	renderDraftCharacter (character) {
		const valueStyles = {
			fontSize: '2em',
			fontWeight: 600,
			padding: '0 .4em'
		};

		return (
			<li
				key={character.uuid}
			>
				<Paper style={{marginBottom: '0.25em'}}>
					<h4>{character.name}</h4>
					<IconButton
						disabled={!this.props.tournament.users.ids[this.props.tournament.users.result[0]].drafting}
						onTouchTap={() => this.draftCharacter(character, this.props.me.uuid)}
					>
						<AddCircleOutline color={cyan500}/>
					</IconButton>
					<div style={{...valueStyles, float: 'left'}}>
						{character.users[this.props.tournament.users.result[0]].value}
					</div>
					<div style={{...valueStyles, float: 'right'}}>
						{character.users[this.props.tournament.users.result[1]].value}
					</div>
				</Paper>
			</li>
		);
	}

	// LEFT COL USER INFO AND CHARS

	// MIDDLE:
		// Powerup buttons and stuff
		// draft characters // just a click button
		// little inspect cards with streaks and values // draggable obvs


	// RIGHT COL USER INFO AND CHARS // not draggable
		// maybe seedingInProgress for your opponent? //draggable


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

	updateSeeds (data) {
		this.props.updateSeeds(this.props.tournament.slug, data)
	}

	draftCharacter (character, myUuid) {
		this.props.draftCharacter(this.props.tournament.slug, character, myUuid, this.props.me.token);
	}

	submitSeeds () {
		this.props.submitSeeds(this.props.tournament.slug, this.props.tournament.seedValues, this.props.me.token);
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		tournament: getTournamentFromState(state, ownProps.params.tournamentSlug),
		me: getMe(state),
	}
}

export default connect(mapStateToProps, { fetchTournament, updateSeeds, submitSeeds, draftCharacter })(TournamentLanding);
