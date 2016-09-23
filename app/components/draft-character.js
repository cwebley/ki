import React, { PropTypes } from 'react';
import { green500, cyan500, red500 } from 'material-ui/styles/colors';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import AddCircleOutline from 'material-ui/svg-icons/content/add-circle-outline';

export default function DraftCharacter ({ drafting, leftUserUuid, rightUserUuid, character, onDraftCharacter }) {
	const valueStyles = {
		fontSize: '2em',
		fontWeight: 600
	};
	const dataStyles = {
		flex: '1 1 20%'
	}

	let leftStreakText = '';
	let leftStreakStyle = {
		flex: '0 1 10%'
	};
	if (character.users[leftUserUuid].globalStreak > 0) {
		leftStreakText = character.users[leftUserUuid].globalStreak + 'W';
		leftStreakStyle.color = green500;
	}
	if (character.users[leftUserUuid].globalStreak < 0) {
		leftStreakText = -1 * character.users[leftUserUuid].globalStreak + 'L';
		leftStreakStyle.color = red500;
	}

	let rightStreakText = '';
	let rightStreakStyle = {
		flex: '0 1 10%'
	};
	if (character.users[rightUserUuid].globalStreak > 0) {
		rightStreakText = character.users[rightUserUuid].globalStreak + 'W';
		rightStreakStyle.color = green500;
	}
	if (character.users[rightUserUuid].globalStreak < 0) {
		rightStreakText = -1 * character.users[rightUserUuid].globalStreak + 'L';
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
						{`${character.users[leftUserUuid].wins} - ${character.users[leftUserUuid].losses}`}
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
						disabled={drafting}
						onTouchTap={() => onDraftCharacter(character)}
					>
						<AddCircleOutline color={cyan500}/>
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
						{`${character.users[rightUserUuid].wins} - ${character.users[rightUserUuid].losses}`}
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
	onDraftCharacter: PropTypes.func.isRequired,
};
