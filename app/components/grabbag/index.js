import React, { PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { containerClass, grabbagRowClass, powerButton } from './styles.css';
import GrabbagCharacterButton from './grabbag-character-button';

export default function Grabbag ({ grabbag, onPurchaseGrabbag, onUseGrabbagCharacter, coins, tournamentActive, characterList }) {
	return (
		<div className={containerClass}>
			<div className={powerButton}>
				<RaisedButton
					label="Grabbag"
					secondary
					fullWidth
					onTouchTap={onPurchaseGrabbag}
					disabled={!tournamentActive}
				/>
			</div>
			{
				!!grabbag.length && grabbag.map((grabbagItem, grabbagIndex) =>
					<div
						key={grabbagIndex}
						className={grabbagRowClass}
					>
						{
							grabbagItem.map((characterUuid, i) =>
								<GrabbagCharacterButton
									key={grabbagIndex + i}
									name={characterList[characterUuid].name}
									value={characterList[characterUuid].value}
									streak={characterList[characterUuid].streak}
									onClick={onUseGrabbagCharacter.bind(null, grabbagIndex, characterUuid)}
									disabled={!tournamentActive}
								/>
							)
						}
					</div>
				)
			}
		</div>
	);
}

Grabbag.displayName = 'Grabbag';

Grabbag.propTypes = {
	grabbag: PropTypes.array.isRequired,
	onPurchaseGrabbag: PropTypes.func.isRequired,
	onUseGrabbagCharacter: PropTypes.func.isRequired,
	coins: PropTypes.number.isRequired,
	tournamentActive: PropTypes.bool.isRequired,
	characterList: PropTypes.object.isRequired
};
