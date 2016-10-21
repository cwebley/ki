import React, { PropTypes } from 'react'
import intToStreak from 'int-to-streak';
import { green500, red500 } from 'material-ui/styles/colors';

export default function previousMatch ({leftUser, rightUser, previousMatch}) {
	let leftPreviousData;
	let rightPreviousData;

	if (previousMatch.result[0] === leftUser.uuid) {
		leftPreviousData = previousMatch.ids[previousMatch.result[0]];
		rightPreviousData = previousMatch.ids[previousMatch.result[1]];
	}
	if (previousMatch.result[1] === leftUser.uuid) {
		leftPreviousData = previousMatch.ids[previousMatch.result[1]];
		rightPreviousData = previousMatch.ids[previousMatch.result[0]];
	}

	const leftStreak = intToStreak(leftPreviousData.characterStreak);
	const rightStreak = intToStreak(rightPreviousData.characterStreak);

	const commonStreakStyles = {
		marginLeft: '1rem'
	}
	const valueStyles = {
		marginRight: '1rem',
		fontWeight: 600
	}

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

	return (
		<div style={{paddingTop: '1em'}}>
			<h5>Previous Match:</h5>
			<div>
				<span style={valueStyles}>{leftPreviousData.value}</span>
				<span>{leftUser.characters.ids[leftPreviousData.characterUuid].name}</span>
				<span style={leftStreakStyle}>{leftStreak}</span>
			</div>
			vs
			<div>
				<span style={valueStyles}>{rightPreviousData.value}</span>
				<span>{rightUser.characters.ids[rightPreviousData.characterUuid].name}</span>
				<span style={rightStreakStyle}>{rightStreak}</span>
			</div>
		</div>
	)
}

previousMatch.propTypes = {
	leftUser: PropTypes.object.isRequired,
	rightUser: PropTypes.object.isRequired,
	previousMatch: PropTypes.object.isRequired
}
