import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import fetchTournament from '../actions/fetch-tournament';
import updateSeeds from '../actions/update-seeds';
import submitSeeds from '../actions/submit-seeds';
import draftCharacter from '../actions/draft-character';
import submitGame from '../actions/submit-game';
import rematch from '../actions/rematch';
import oddsmaker from '../actions/oddsmaker';
import useInspect from '../actions/use-inspect';
import decrementCharacter from '../actions/decrement-character';
import toggleDraftFilter from '../actions/toggle-draft-filter';
import undoLastGame from '../actions/undo-last-game';
import extendTournament from '../actions/extend-tournament';
import updateInspectState from '../actions/update-inspect-state';
import updateMatchups from '../actions/update-matchups';

import { getTournamentFromState, getMe, getFormState } from '../store';
import * as formActions from '../actions/forms';
import Form from './form';
import Check from './check';
import { getFormValue } from '../store/forms';

import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';

import SeedContainer from './seed-container';
import InspectContainer from './inspect-container';
import Draft from './draft';
import TournamentCharacter from './tournament-character';

import IconUndo from 'material-ui/svg-icons/content/undo';
import IconRedo from 'material-ui/svg-icons/content/redo';
import { green500, red500, amber500 } from 'material-ui/styles/colors';
import LinearProgress from 'material-ui/LinearProgress';

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
		listStyleType: 'none'
	},
	powerBlock: {
		paddingTop: '2em'
	},
	power: {
		padding: '0 25%'
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
};

class TournamentLanding extends Component {
	constructor () {
		super();
		this.updateSeeds = this.updateSeeds.bind(this);
		this.updateInspectState = this.updateInspectState.bind(this);
		this.handleToggleDraftFilter = this.handleToggleDraftFilter.bind(this);
		this.handleDraftCharater = this.handleDraftCharater.bind(this);
		this.handleDecrementCharacter = this.handleDecrementCharacter.bind(this);
		this.handleOddsmaker = this.handleOddsmaker.bind(this);
	}

	static propTypes = {
		me: PropTypes.object,
		tournament: PropTypes.object.isRequired,
		fetchTournament: PropTypes.func.isRequired,
		updateSeeds: PropTypes.func.isRequired
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
				const draftCharacters = this.props.tournament.draft.characters.result.map(uuid => ({
					...this.props.tournament.draft.characters.ids[uuid],
					...this.props.tournament.draft.characters.ids[uuid].users[this.props.tournament.users.result[1]],
					draft: true
				}));
				this.props.updateSeeds(this.props.tournament.slug, [...opponentCharacters, ...draftCharacters]);
			});

		// poll for updates
		this.pollingInterval = setInterval(() => {
			this.props.fetchTournament(this.props.params.tournamentSlug, this.props.me.token);
		}, 5000);
	}

	componentWillUnmount () {
		// stop polling if you navigate away from this page
		clearInterval(this.pollingInterval);
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
				{this.props.tournament.active && <div style={{
					position: 'absolute',
					left: 0,
					bottom: 0
				}}>
					<FlatButton
						label="Dangerous Undo"
						hoverColor={red500}
						icon={<IconUndo />}
						disabled={!this.props.tournament.previous}
						onTouchTap={() => this.undoLastGame()}
					/>
				</div>}
				{this.props.tournament.championUuid && <div style={{
					position: 'absolute',
					right: 0,
					bottom: 0
				}}>
					<FlatButton
						label={`Extend goal to ${this.props.tournament.goal + 25} pts`}
						hoverColor={red500}
						icon={<IconRedo />}
						onTouchTap={() => this.extendTournament()}
					/>
				</div>}
				{this.props.tournament.reasons && this.props.tournament.reasons.length > 0 && <Snackbar
					open={!!this.props.tournament.reasons.length}
					message={this.props.tournament.reasons[0].message}
					autoHideDuration={10000}
				/>}
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
					{characters.map(c =>
						<TournamentCharacter
							key={c.uuid}
							tournamentActive={tournament.active}
							coinsAvailable={tournament.users.ids[tournament.users.result[0]].coins}
							name={c.name}
							slug={c.slug}
							value={c.value}
							streak={c.streak}
							wins={c.wins}
							losses={c.losses}
							onOddsmaker={this.handleOddsmaker}
						/>
					)}
				</ol>
			</div>
		);
	}

	renderCenter (seedingInProgress, draftInProgress) {
		const { tournament } = this.props;
		const previousUser = tournament.draft.previous && tournament.users.ids[tournament.draft.previous.userUuid];
		return (
			<div style={styles.centerColStyle}>
				{seedingInProgress && <RaisedButton
					label="Submit Seeds"
					primary
					disabled={tournament.users.ids[tournament.users.result[0]].seeded}
					onTouchTap={() => this.submitSeeds()}
				/>}
				{draftInProgress && <Draft
					characters={tournament.draft.characters.result.map(cUuid => tournament.draft.characters.ids[cUuid])}
					completedPicks={tournament.draft.current}
					totalPicks={tournament.draft.total}
					onToggleDraftFilter={this.handleToggleDraftFilter}
					onDraftCharacter={this.handleDraftCharater}
					drafting={this.props.tournament.users.ids[this.props.tournament.users.result[0]].drafting}
					leftUserUuid={tournament.users.result[0]}
					rightUserUuid={tournament.users.result[1]}
					previousUser={previousUser}
					previousCharacter={previousUser && previousUser.characters.ids[tournament.draft.previous.characterUuid]}
				/>}
				{tournament.active && this.renderTournamentActions()}
				{tournament.inspect.users && this.renderInspect()}
			</div>
		);
	}

	renderRightUser (seedingInProgress) {
		const { tournament } = this.props;
		const user = tournament.users.ids[tournament.users.result[1]];
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
					{characters.map(c =>
						<TournamentCharacter
							key={c.uuid}
							opponentCharacter
							tournamentActive={tournament.active}
							coinsAvailable={tournament.users.ids[tournament.users.result[0]].coins}
							name={c.name}
							slug={c.slug}
							value={c.value}
							streak={c.streak}
							wins={c.wins}
							losses={c.losses}
							onDecrementCharacter={this.handleDecrementCharacter}
						/>
					)}
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
		let percentComplete = 100 * user.score / this.props.tournament.goal;
		if (percentComplete > 100) {
			percentComplete = 100;
		}

		return (
			<div>
				<div style={{fontSize: 'larger'}}>{user.score}</div>
				<LinearProgress mode="determinate" value={percentComplete} />
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
		const leftCharacter = leftUser.characters.ids[leftUser.upcoming[0].characterUuid];
		const rightCharacter = rightUser.characters.ids[rightUser.upcoming[0].characterUuid];
		let leftPrevious;
		let	rightPrevious;

		if (tournament.previous && tournament.previous.result[0] === tournament.users.result[0]) {
			leftPrevious = tournament.previous.ids[tournament.previous.result[0]];
			rightPrevious = tournament.previous.ids[tournament.previous.result[1]];
		}
		if (tournament.previous && tournament.previous.result[1] === tournament.users.result[0]) {
			leftPrevious = tournament.previous.ids[tournament.previous.result[1]];
			rightPrevious = tournament.previous.ids[tournament.previous.result[0]];
		}

		return (
			<div>
				<h1>{tournament.name}</h1>
				{tournament.championUuid && <h3>{`${tournament.users.ids[tournament.championUuid].name} is the Champion!`}</h3>}
				<div>
					<div style={{
						width: '50%',
						float: 'left',
						padding: '2% 1% 2% 2%'
					}}>
						<RaisedButton
							style={{width: '100%'}}
							label={`(${leftCharacter.value}) ${leftCharacter.name}`}
							primary
							onTouchTap={() => this.submitGame(leftUser, leftCharacter, rightUser, rightCharacter)}
							disabled={!!tournament.championUuid}
						/>
					</div>
					<div style={{
						width: '50%',
						float: 'right',
						padding: '2% 2% 2% 1%'
					}}>
						<RaisedButton
							style={{width: '100%'}}
							label={`(${rightCharacter.value}) ${rightCharacter.name}`}
							primary
							onTouchTap={() => this.submitGame(rightUser, rightCharacter, leftUser, leftCharacter)}
							disabled={!!tournament.championUuid}
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
					{tournament.previous && <div style={{paddingTop: '1em'}}>
						<h5>Previous Match:</h5>
						<div>{`(${leftPrevious.value}) ${leftUser.characters.ids[leftPrevious.characterUuid].name}`}</div>
						vs
						<div>{`(${rightPrevious.value}) ${rightUser.characters.ids[rightPrevious.characterUuid].name}`}</div>
					</div>}
				</div>
				<div style={styles.powerBlock}>
					<div style={styles.power}>
						<RaisedButton
							style={{width: '100%'}}
							label="Rematch"
							secondary
							disabled={leftUser.coins < 3 || !tournament.rematchAvailable}
							onTouchTap={() => this.useRematch()}
						/>
					</div>
					<div style={styles.power}>
						<RaisedButton
							style={{width: '100%'}}
							label={tournament.inspect.remaining !== undefined && !tournament.inspect.available ? `Inspect (${tournament.inspect.remaining})` : 'Inspect'}
							secondary
							onTouchTap={() => this.useInspect()}
							disabled={leftUser.coins < 2 || !tournament.inspect.available}
						/>
					</div>
				</div>
			</div>
		);
	}

	renderInspect () {
		const { tournament } = this.props;
		const leftUserUuid = tournament.inspect.users.result[0];
		const rightUserUuid = tournament.inspect.users.result[1];

		let leftUpcomingCharacters;
		if (tournament.inspect.custom && tournament.inspect.custom[leftUserUuid]) {
			leftUpcomingCharacters = tournament.inspect.custom[leftUserUuid];
		} else {
			leftUpcomingCharacters = tournament.inspect.users.ids[leftUserUuid];
		}
		const leftHydratedCharacters = leftUpcomingCharacters.map(matchData => Object.assign(
			{},
			tournament.users.ids[leftUserUuid].characters.ids[matchData.characterUuid],
			{
				matchUuid: matchData.uuid,
				userUuid: leftUserUuid
			}
		));

		let rightUpcomingCharacters;
		if (tournament.inspect.custom && tournament.inspect.custom[rightUserUuid]) {
			rightUpcomingCharacters = tournament.inspect.custom[rightUserUuid];
		} else {
			rightUpcomingCharacters = tournament.inspect.users.ids[rightUserUuid];
		}
		const rightHydratedCharacters = rightUpcomingCharacters.map(matchData => Object.assign(
			{},
			tournament.users.ids[rightUserUuid].characters.ids[matchData.characterUuid],
			{
				matchUuid: matchData.uuid,
				userUuid: rightUserUuid
			}
		));

		return (
			<div>
				<div style={{
					marginTop: '1em',
					overflow: 'auto'
				}}>
					<div style={{
						width: '50%',
						float: 'left'
					}}>
						<InspectContainer
							characters={leftHydratedCharacters}
							updateInspectState={this.updateInspectState}
							userUuid={leftUserUuid}
							side="left"
						/>
					</div>
					<div style={{
						width: '50%',
						float: 'right'
					}}>
						<InspectContainer
							characters={rightHydratedCharacters}
							updateInspectState={this.updateInspectState}
							userUuid={rightUserUuid}
							side="right"
						/>
					</div>
				</div>
				<div style={{
					marginTop: '1em'
				}}>
					<RaisedButton
						label="Save Changes"
						primary
						disabled={!tournament.inspect.custom || (!tournament.inspect.custom[rightUserUuid] && !tournament.inspect.custom[leftUserUuid])}
						onTouchTap={() => this.updateMatchups()}
					/>
				</div>
			</div>
		);
	}

	handleToggleDraftFilter () {
		this.props.toggleDraftFilter(this.props.tournament.slug, this.props.tournament.users.result[0], this.props.tournament.users.result[1]);
	}

	updateSeeds (data) {
		this.props.updateSeeds(this.props.tournament.slug, data);
	}

	updateInspectState (data) {
		this.props.updateInspectState(this.props.tournament.slug, data.userUuid, data.state.map(c => Object.assign({}, {
			characterUuid: c.uuid,
			uuid: c.matchUuid
		})));
	}

	handleDraftCharater (character) {
		this.props.draftCharacter(this.props.tournament.slug, character, this.props.me.uuid, this.props.me.token);
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

	handleOddsmaker (characterSlug) {
		this.props.oddsmaker(characterSlug, this.props.tournament.slug, this.props.me.token);
	}

	handleDecrementCharacter (characterSlug) {
		this.props.decrementCharacter(characterSlug, this.props.tournament.slug, this.props.me.token);
	}

	undoLastGame () {
		this.props.undoLastGame(this.props.tournament.slug, this.props.me.token);
	}

	extendTournament () {
		const newGoal = this.props.tournament.goal + 25;
		this.props.extendTournament(this.props.tournament.slug, newGoal, this.props.me.token);
	}

	useInspect () {
		this.props.useInspect(this.props.tournament.slug, this.props.me.token);
	}

	updateMatchups () {
		const { tournament } = this.props;

		const leftUserUuid = tournament.inspect.users.result[0];
		const rightUserUuid = tournament.inspect.users.result[1];

		let leftUpcomingCharacterSlugs;
		if (tournament.inspect.custom && tournament.inspect.custom[leftUserUuid]) {
			leftUpcomingCharacterSlugs = tournament.inspect.custom[leftUserUuid].map(inspectCharacter => tournament.users.ids[leftUserUuid].characters.ids[inspectCharacter.characterUuid].slug);
		} else {
			leftUpcomingCharacterSlugs = tournament.inspect.users.ids[leftUserUuid].map(inspectCharacter => tournament.users.ids[leftUserUuid].characters.ids[inspectCharacter.characterUuid].slug);
		}

		let rightUpcomingCharacterSlugs;
		if (tournament.inspect.custom && tournament.inspect.custom[rightUserUuid]) {
			rightUpcomingCharacterSlugs = tournament.inspect.custom[rightUserUuid].map(inspectCharacter => tournament.users.ids[rightUserUuid].characters.ids[inspectCharacter.characterUuid].slug);
		} else {
			rightUpcomingCharacterSlugs = tournament.inspect.users.ids[rightUserUuid].map(inspectCharacter => tournament.users.ids[rightUserUuid].characters.ids[inspectCharacter.characterUuid].slug);
		}

		const matchupData = {
			[tournament.users.ids[leftUserUuid].slug]: leftUpcomingCharacterSlugs,
			[tournament.users.ids[rightUserUuid].slug]: rightUpcomingCharacterSlugs
		};
		this.props.updateMatchups(this.props.tournament.slug, matchupData, this.props.me.token);
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		tournament: getTournamentFromState(state, ownProps.params.tournamentSlug),
		me: getMe(state),
		matchupForm: getFormState(state, 'matchup')
	};
};

export default connect(mapStateToProps, {
	fetchTournament, updateSeeds, submitSeeds,
	draftCharacter, submitGame, ...formActions,
	rematch, oddsmaker, useInspect,
	decrementCharacter, toggleDraftFilter,
	undoLastGame, updateInspectState, updateMatchups,
	extendTournament
})(TournamentLanding);
