import React, { PropTypes } from 'react';
import { green500, cyan500, red500 } from 'material-ui/styles/colors';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import AddCircleOutline from 'material-ui/svg-icons/content/add-circle-outline';
import intToStreak from 'int-to-streak';

export default function DraftCharacter ({ drafting, leftUserUuid, rightUserUuid, character, onDraftCharacter }) {
	const valueStyles = {
		fontSize: '2em',
		fontWeight: 600
	};
	const dataStyles = {
		flex: '1 1 20%'
	};

	const leftStreakText = intToStreak(character.users[leftUserUuid].globalStreak);
	let leftStreakStyle = {
		flex: '0 1 10%'
	};
	if (character.users[leftUserUuid].globalStreak > 0) {
		leftStreakStyle.color = green500;
	}
	if (character.users[leftUserUuid].globalStreak < 0) {
		leftStreakStyle.color = red500;
	}

	const rightStreakText = intToStreak(character.users[rightUserUuid].globalStreak);
	let rightStreakStyle = {
		flex: '0 1 10%'
	};
	if (character.users[rightUserUuid].globalStreak > 0) {
		rightStreakStyle.color = green500;
	}
	if (character.users[rightUserUuid].globalStreak < 0) {
		rightStreakStyle.color = red500;
	}

	return (
		<li>
			<Paper style={{
				marginBottom: '0.25em',
				width: '100%',
				display: 'flex',
				justifyContent: 'space-around',
				alignItems: 'center'
			}}>
				<div style={dataStyles}>
					<div style={valueStyles}>
						{character.users[leftUserUuid].value}
					</div>
					<div>
						{`${character.users[leftUserUuid].globalWins} - ${character.users[leftUserUuid].globalLosses}`}
					</div>
				</div>
				<div style={leftStreakStyle}>
					{leftStreakText}
				</div>
				<div style={{
					flex: '2 1 40%'
				}}>
					<h4>{character.name}</h4>
					<IconButton
						disabled={!drafting}
						onTouchTap={() => onDraftCharacter(character)}
					>
						<AddCircleOutline color={cyan500} />
					</IconButton>
				</div>
				<div style={rightStreakStyle}>
					{rightStreakText}
				</div>
				<div style={dataStyles}>
					<div style={valueStyles}>
						{character.users[rightUserUuid].value}
					</div>
					<div>
						{`${character.users[rightUserUuid].globalWins} - ${character.users[rightUserUuid].globalLosses}`}
					</div>
				</div>
			</Paper>
		</li>
	);
}

DraftCharacter.propTypes = {
	drafting: PropTypes.bool.isRequired,
	leftUserUuid: PropTypes.string.isRequired,
	rightUserUuid: PropTypes.string.isRequired,
	character: PropTypes.shape({
		users: PropTypes.object.isRequired
	}),
	onDraftCharacter: PropTypes.func.isRequired
};
