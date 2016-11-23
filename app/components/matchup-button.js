import React, { PropTypes } from 'react';
import intToStreak from 'int-to-streak';
import RaisedButton from 'material-ui/RaisedButton';

export default function matchupButton ({name, value, streak, onClick, disabled}) {
	const streakText = intToStreak(streak);

	return (
		<div style={{
			width: '50%',
			float: 'left',
			padding: '2% 1% 2% 2%'
		}}>
			<RaisedButton
				style={{width: '100%'}}
				label={`(${value}) ${name}  ${streakText ? `(${streakText})` : ''}`}
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
