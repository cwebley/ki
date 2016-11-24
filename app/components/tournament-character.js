import React, { PropTypes } from 'react';
import intToStreak from 'int-to-streak';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import IconCasino from 'material-ui/svg-icons/places/casino';
import IconFire from 'material-ui/svg-icons/social/whatshot';
import IconTrendingDown from 'material-ui/svg-icons/action/trending-down';
import { green500, red500 } from 'material-ui/styles/colors';

import { heatingUp, onFire } from '../styles.css';

export default function TournamentCharacter (props) {
	const streakText = intToStreak(props.streak);
	let streakStyle = {};
	if (props.streak > 0) {
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
		streakStyle.color = red500;
	}

	let backgroundClass = '';
	if (props.streak === 2) {
		backgroundClass = heatingUp;
	}
	if (props.streak > 2) {
		backgroundClass = onFire;
	}

	return (
		<li>
			<Paper className={backgroundClass} style={{
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
	opponentCharacter: PropTypes.bool,
	tournamentActive: PropTypes.bool,
	coinsAvailable: PropTypes.number,
	name: PropTypes.string,
	slug: PropTypes.string,
	streak: PropTypes.number,
	value: PropTypes.number,
	wins: PropTypes.number,
	losses: PropTypes.number,
	onDecrementCharacter: PropTypes.func,
	onOddsmaker: PropTypes.func
};
