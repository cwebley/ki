import React, { PropTypes, Component } from 'react';
import DraftCharacter from './draft-character';

import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import IconCasino from 'material-ui/svg-icons/places/casino';
import IconFire from 'material-ui/svg-icons/social/whatshot';
import IconTrendingDown from 'material-ui/svg-icons/action/trending-down';
import { green500, red500 } from 'material-ui/styles/colors';

export default function TournamentCharacter (props) {
	let streakText = '';
	let streakStyle = {};
	if (props.streak > 0) {
		streakText = props.streak + 'W';
		streakStyle.color = green500;
		if (props.streak === 2) {
			streakStyle.fontSize = '1.25em';
			streakStyle.fontWeight = '500';
		}
		if (props.streak >= 3) {
			streakStyle.fontWeight = 600;
			streakStyle.fontSize = '1.5em';
		}
	}
	if (props.streak < 0) {
		streakText = -1 * props.streak + 'L';
		streakStyle.color = red500;
	}


	return (
		<li>
			<Paper style={{
				overflow: 'auto'
			}}>
				<div style={{
					fontSize: '1.3em',
					lineHeight: '1.3em'
				}}>
					{props.value || '?'}
				</div>
				<div>
					{props.streak >= 3 && <IconFire color={red500} />}
					<h4 style={{display: 'inline'}}>{props.name}</h4>
					{props.streak >= 3 && <IconFire color={red500} />}
					<div>{props.wins} - {props.losses}</div>
				</div>
				{!props.opponentCharacter && <div style={{
					float: 'left',
					paddingLeft: '1em'
				}}>
					<IconButton
						disabled={!props.tournamentActive || props.coinsAvailable < 3}
						onTouchTap={props.onOddsmaker.bind(null, props.slug)}
					>
						<IconCasino />
					</IconButton>
				</div>}
				{props.opponentCharacter && <div style={{
					float: 'left',
					paddingLeft: '1em'
				}}>
					<IconButton
						disabled={!props.tournamentActive || props.value <= 1 || props.coinsAvailable < 1}
						onTouchTap={props.onDecrementCharacter.bind(null, props.slug)}
					>
						<IconTrendingDown />
					</IconButton>
				</div>}
				<div style={{
					float: 'right',
					paddingRight: '1em',
					lineHeight: '2.5em'
				}}>
					<div style={streakStyle}>{streakText}</div>
				</div>
			</Paper>
		</li>
	);
}

TournamentCharacter.propTypes = {
	opponentCharacter: React.PropTypes.bool,
	tournamentActive: React.PropTypes.bool,
	coinsAvailable: React.PropTypes.number,
	name: React.PropTypes.string,
	slug: React.PropTypes.string,
	streak: React.PropTypes.number,
	value: React.PropTypes.number,
	wins: React.PropTypes.number,
	losses: React.PropTypes.number,
	onDecrementCharacter: React.PropTypes.func,
	onOddsmaker: React.PropTypes.func
};
