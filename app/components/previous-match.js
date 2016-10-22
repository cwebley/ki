import React, { PropTypes } from 'react';
import intToStreak from 'int-to-streak';
import { green500, red500 } from 'material-ui/styles/colors';

export default function previousMatch ({leftUser, rightUser, previousMatch}) {
	let leftPreviousData;
	let rightPreviousData;
	let leftUserStyle = {};
	let rightUserStyle = {};

	if (previousMatch.result[0] === leftUser.uuid) {
		leftPreviousData = previousMatch.ids[previousMatch.result[0]];
		rightPreviousData = previousMatch.ids[previousMatch.result[1]];
		rightUserStyle.opacity = 0.5;

		if (previousMatch.supreme) {
			leftUserStyle.border = '3px solid ' + green500;
			leftUserStyle.borderRadius = '1em';
		}
	}

	if (previousMatch.result[1] === leftUser.uuid) {
		leftPreviousData = previousMatch.ids[previousMatch.result[1]];
		rightPreviousData = previousMatch.ids[previousMatch.result[0]];
		leftUserStyle.opacity = 0.5;

		if (previousMatch.supreme) {
			rightUserStyle.border = '3px solid ' + green500;
			rightUserStyle.borderRadius = '1em';
		}
	}

	const leftStreak = intToStreak(leftPreviousData.characterStreak);
	const rightStreak = intToStreak(rightPreviousData.characterStreak);

	const commonStreakStyles = {
		marginLeft: '1rem'
	};

	let leftStreakStyle = Object.assign({}, commonStreakStyles);
	if (leftPreviousData.characterStreak > 0) {
		leftStreakStyle.color = green500;
	}
	if (leftPreviousData.characterStreak < 0) {
		leftStreakStyle.color = red500;
	}

	let rightStreakStyle = Object.assign({}, commonStreakStyles);
	if (rightPreviousData.characterStreak > 0) {
		rightStreakStyle.color = green500;
	}
	if (rightPreviousData.characterStreak < 0) {
		rightStreakStyle.color = red500;
	}

	const valueStyles = {
		marginRight: '1rem',
		fontWeight: 600
	};

	return (
		<div style={{paddingTop: '1em'}}>
			<h5>Previous Match:</h5>
			<div style={leftUserStyle}>
				<span style={valueStyles}>{leftPreviousData.value}</span>
				<span>{leftUser.characters.ids[leftPreviousData.characterUuid].name}</span>
				<span style={leftStreakStyle}>{leftStreak}</span>
			</div>
			vs
			<div style={rightUserStyle}>
				<span style={valueStyles}>{rightPreviousData.value}</span>
				<span>{rightUser.characters.ids[rightPreviousData.characterUuid].name}</span>
				<span style={rightStreakStyle}>{rightStreak}</span>
			</div>
		</div>
	);
}

previousMatch.propTypes = {
	leftUser: PropTypes.object.isRequired,
	rightUser: PropTypes.object.isRequired,
	previousMatch: PropTypes.object.isRequired
};
