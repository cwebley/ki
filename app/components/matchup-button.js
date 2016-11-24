import React, { PropTypes } from 'react';
import intToStreak from 'int-to-streak';
import RaisedButton from 'material-ui/RaisedButton';
import { red500 } from 'material-ui/styles/colors';
import { heatingUp, onFire } from '../styles.css';

export default function matchupButton ({name, value, streak, onClick, disabled}) {
	const streakText = intToStreak(streak);
	const nameStyles = {
		textTransform: 'uppercase',
		fontWeight: '500',
		margin: '0px',
		paddingLeft: '16px',
		paddingRight: '16px',
		color: 'white',
		userSelect: 'none'
	};

	let streakClass = '';
	if (streak === 2) {
		streakClass = heatingUp;
	}
	if (streak === 3) {
		streakClass = onFire;
	}

	return (
		<div style={{
			width: '50%',
			float: 'left',
			padding: '2% 1% 2% 2%'
		}}>
			<RaisedButton
				style={{width: '100%'}}
				children={[
					<span
						key="value"
						style={{
							fontWeight: '500'
						}}>
						{value}
					</span>,
					<span key="name" style={nameStyles}>{name}</span>,
					<span key="streak" className={streakClass}>
						{streak ? (intToStreak(streak)) : ''}
					</span>
				]}
				primary
				onTouchTap={onClick}
				disabled={disabled}
			/>
		</div>
	);
}

matchupButton.propTypes = {
	name: PropTypes.string.isRequired,
	value: PropTypes.number.isRequired,
	streak: PropTypes.number.isRequired,
	onClick: PropTypes.func.isRequired,
	disabled: PropTypes.bool.isRequired
};