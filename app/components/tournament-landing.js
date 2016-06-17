import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import fetchTournament from '../actions/fetch-tournament';

import { getTournamentFromState, getMe } from '../store';
import get from 'lodash.get';

import Paper from 'material-ui/Paper';

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
	}
}

class TournamentLanding extends Component {
	componentDidMount () {
		this.props.fetchTournament(this.props.params.tournamentSlug, this.props.me.token);
	}

	render () {
		if (!this.props.tournament.users) {
			return (
				<div>Tournament loading...</div>
			);
		}
		const hydratedUsers = this.props.tournament.users.result.map(uuid => this.props.tournament.users.ids[uuid]);
		return (
				<div style={styles.pageStyle}>
					CHARACTERS AND STUFF
					{this.renderLeftUser(hydratedUsers[0])}
					{this.renderRightUser(hydratedUsers[1])}
					<div>
						{ this.props.children }
					</div>
				</div>
		);
	}

	renderLeftUser (user) {
		console.log("LEFT USER : ", user)
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

		/*
			<div className={topClass.join(' ')}>
			  <div className="card-left-column">

				<div className="value-wrapper">
				  <button className={upArrowClass}></button>
				  <div className="value">
					<span className="value-text">{this.props.value}</span>
				  </div>
				  <button className={downArrowClass} onClick={this._downArrowClick}></button>
				</div>
				<div className="character-info">
				  <h3 className="character-name">{this.props.name}</h3>
				  <div className="record">{this.props.wins} - {this.props.losses}</div>
				</div>

			  </div>
			  <div className="card-right-column">
			  <span className="streak">{streakText}</span>
			  </div>
			  <div className="card-center-column">
				<button className={btnClass} onClick={this._onClick}>Choose</button>
			  </div>
			</div>
		*/

	}

	// getStyles () {
	//
	//
	// 	if (this.props.width === MEDIUM || this.props.width === LARGE) {
	// 		styles.content = Object.assign(styles.content, styles.contentWhenMedium);
	// 	}
	// 	return styles;
	// }

	renderRightUser (user) {
		console.log("R*GHT USER : ", user)
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
}

const mapStateToProps = (state, ownProps) => {
	return {
		tournament: getTournamentFromState(state, ownProps.params.tournamentSlug),
		me: getMe(state),
	}
}

export default connect(mapStateToProps, { fetchTournament })(TournamentLanding);
