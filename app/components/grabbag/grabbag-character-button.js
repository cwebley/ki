import React, { PropTypes } from 'react';
import intToStreak from 'int-to-streak';
import FlatButton from 'material-ui/FlatButton';
import { grabbagItemClass, characterNameClass, characterValueClass } from './styles.css';
import { heatingUpText, onFireText } from '../../styles.css';

export default function grabbagCharacterButton ({name, value, streak, onClick, disabled}) {
	let streakClass = '';
	if (streak === 2) {
		streakClass = heatingUpText;
	}
	if (streak >= 3) {
		streakClass = onFireText;
	}

	return (
		<div className={grabbagItemClass}>
			<FlatButton
				style={{width: '100%'}}
				children={[
					<span
						key="value"
						className={characterValueClass}
					>
						{value}
					</span>,
					<span
						key="name"
						className={characterNameClass}
					>
						{name}
					</span>,
					<span
						key="streak"
						className={streakClass}
					>
						{streak ? intToStreak(streak) : ''}
					</span>
				]}
				onTouchTap={onClick}
				disabled={disabled}
			/>
		</div>
	);
}

grabbagCharacterButton.propTypes = {
	name: PropTypes.string.isRequired,
	value: PropTypes.number.isRequired,
	streak: PropTypes.number.isRequired,
	onClick: PropTypes.func.isRequired,
	disabled: PropTypes.bool
};
