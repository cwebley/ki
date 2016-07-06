import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import fetchTournament from '../actions/fetch-tournament';
import updateSeeds from '../actions/update-seeds';
import submitSeeds from '../actions/submit-seeds';
import draftCharacter from '../actions/draft-character';
import submitGame from '../actions/submit-game';
import rematch from '../actions/rematch';

import { getTournamentFromState, getMe, getFormState } from '../store';
import * as formActions from '../actions/forms';
import Form from './form';
import Check from './check';
import { getFormValue } from '../store/forms';

import get from 'lodash.get';

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

import SeedContainer from './seed-container';

import IconButton from 'material-ui/IconButton';
import AddCircleOutline from 'material-ui/svg-icons/content/add-circle-outline';
import { cyan500, green500, red500, amber500 } from 'material-ui/styles/colors';



const styles = {
	pageStyle: {
		textAlign: 'center'
	},
	userHeaderStyle: {
		paddingBottom: '0.5em'
	},
	statItemStyle: {
		display: 'inline-block',
		width: '50%'
	},
	resetListStyle: {
		margin: 0,
		padding: 0,
		listStyleType: 'none',
	},
	powerBlock: {
		paddingTop: '2em'
	},
	power: {
		padding: '0 25%',
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
					{this.renderLeftUser()}
					{this.renderCenter(seedingInProgress, draftInProgress)}
					{this.renderRightUser(seedingInProgress)}
					<div>
						{ this.props.children }
					</div>
				</div>
		);
	}

	renderLeftUser () {
		const { tournament } = this.props;
		const user = tournament.users.ids[tournament.users.result[0]];
		const characters = user.characters.result.map(uuid => user.characters.ids[uuid]);

		return (
			<div style={styles.leftUserStyle}>
				<h2 style={styles.userHeaderStyle}>{user.name}</h2>
					{tournament.active && this.renderUserStats(user)}
				<ol style={styles.resetListStyle}>
					{characters.map(c => this.renderCharacter(c))}
				</ol>
			</div>
		);
	}

	renderCenter (seedingInProgress, draftInProgress) {
		const { tournament } = this.props;
		return (
			<div style={styles.centerColStyle}>
				{seedingInProgress && <RaisedButton
					label="Submit Seeds"
					primary
					disabled={tournament.users.ids[tournament.users.result[0]].seeded}
					onTouchTap={() => this.submitSeeds()}
				/>}
				{draftInProgress && this.renderDraft()}
				{tournament.active && this.renderTournamentActions()}
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
				<h2 style={styles.userHeaderStyle}>{user.name}</h2>
				{seedingInProgress && <SeedContainer
					characters={tournament.seedCharacters || []}
					maxStartingValue={tournament.maxStartingValue}
					updateSeeds={this.updateSeeds}
				/>}
				{tournament.active && this.renderUserStats(user)}
				{!seedingInProgress && <ol style={styles.resetListStyle}>
					{characters.map(c => this.renderCharacter(c))}
				</ol>}
			</div>
		);
	}

	renderUserStats (user) {
		let streakText = '';
		let streakStyle = {};
		if (user.streak > 0) {
			streakText = user.streak + 'W';
			streakStyle.color = green500;
			if (user.streak === 2 || user.streak > 3) {
				streakStyle.fontWeight = 600;
			}
		}
		if (user.streak < 0) {
			streakText = -1 * user.streak + 'L';
			streakStyle.color = red500;
		}

		return (
			<div>
				<div style={{fontSize: 'larger'}}>{user.score}</div>
				<div>{`${user.wins} - ${user.losses}`}</div>
				<div style={{
					...streakStyle,
					...styles.statItemStyle
				}}>{streakText}</div>
				<div style={{
					...styles.statItemStyle,
					color: amber500,
					fontWeight: 600
				}}>{`${user.coins} coins`}</div>
			</div>
		);
	}

	renderTournamentActions () {
		const { tournament } = this.props;
		const leftUser = tournament.users.ids[tournament.users.result[0]];
		const rightUser = tournament.users.ids[tournament.users.result[1]];
		const leftCharacter = leftUser.characters.ids[leftUser.upcoming[0]];
		const rightCharacter = rightUser.characters.ids[rightUser.upcoming[0]];
		return (
			<div>
				{ tournament.name }
				<div>
					<h3>Matchup</h3>
					<div style={{
						width: '50%',
						float: 'left',
						padding: '2% 1% 2% 2%'
					}}>
						<RaisedButton
							style={{width: '100%'}}
							label={leftCharacter.name}
							primary
							onTouchTap={() => this.submitGame(leftUser, leftCharacter, rightUser, rightCharacter)}
						/>
					</div>
					<div style={{
						width: '50%',
						float: 'right',
						padding: '2% 2% 2% 1%'
					}}>
						<RaisedButton
							style={{width: '100%'}}
							label={rightCharacter.name}
							primary
							onTouchTap={() => this.submitGame(rightUser, rightCharacter, leftUser, leftCharacter)}
						/>
					</div>
					<div style={{
						padding: '0 33%'
					}}>
						<Form
							values={this.props.matchupForm.values}
							formName="matchup"
							update={this.props.update}
							reset={this.props.reset}
						>
							<Check
								name="supreme"
								label="Supreme"
							/>
						</Form>
					</div>
					{ leftUser.previous && <div>
						<h5>Previous Match:</h5>
						<div>{`(${leftUser.previous.value})${leftUser.characters.ids[leftUser.previous.characterUuid].name}`}</div>
						vs
						<div>{`(${rightUser.previous.value})${rightUser.characters.ids[rightUser.previous.characterUuid].name}`}</div>
					</div> }
				</div>
				<div style={styles.powerBlock}>
					<div style={styles.power}>
						<RaisedButton
							style={{width: '100%'}}
							label="Rematch"
							secondary
							disabled={!tournament.rematchAvailable}
							onTouchTap={() => this.useRematch()}
						/>
					</div>
					<div style={styles.power}>
						<RaisedButton
							style={{width: '100%'}}
							label="Oddsmaker"
							secondary
							onTouchTap={() => {}}
						/>
					</div>
					<div style={styles.power}>
						<RaisedButton
							style={{width: '100%'}}
							label="Inspect"
							secondary
							onTouchTap={() => {}}
						/>
					</div>
				</div>
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

	renderCharacter (character) {
		let streakText = '';
		if (character.streak > 0) {
			streakText = character.streak + 'W';
		}
		if (character.streak < 0) {
			streakText = -1 * character.streak + 'L';
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

	submitGame (winningUser, winningCharacter, losingUser, losingCharacter) {
		this.props.submitGame({
			tournamentSlug: this.props.tournament.slug,
			winningUserSlug: winningUser.slug,
			winningCharacterSlug: winningCharacter.slug,
			losingUserSlug: losingUser.slug,
			losingCharacterSlug: losingCharacter.slug,
			supreme: getFormValue(this.props.matchupForm, 'supreme'),
			token: this.props.me.token
		})
		// uncheck the supreme box
		.then(this.props.reset('matchup'));
	}

	useRematch () {
		this.props.rematch(this.props.tournament.slug, this.props.me.token);
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		tournament: getTournamentFromState(state, ownProps.params.tournamentSlug),
		me: getMe(state),
		matchupForm: getFormState(state, 'matchup')
	}
}

export default connect(mapStateToProps, {
	fetchTournament, updateSeeds, submitSeeds,
	draftCharacter, submitGame, ...formActions,
	rematch
})(TournamentLanding);
