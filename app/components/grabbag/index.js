import React, { PropTypes } from 'react';
import { containerClass, grabbagRowClass, grabbagItemClass, powerButton } from './styles.css';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

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
								<div
									key={grabbagIndex + i}
									className={grabbagItemClass}
								>
									<FlatButton
										label={characterList[characterUuid].name}
										onTouchTap={onUseGrabbagCharacter.bind(null, grabbagIndex, characterUuid)}
									/>
								</div>
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
