import React, { PropTypes } from 'react';
import DraftCharacter from './draft-character';
import FlatButton from 'material-ui/FlatButton';
import IconFilterList from 'material-ui/svg-icons/content/filter-list';

const draftListStyle = {
	margin: 0,
	padding: '1em',
	listStyleType: 'none'
};

export default function Draft (props) {
	return (
		<div>
			<h2>Draft it up</h2>
			<div>{`${props.completedPicks} / ${props.totalPicks}`}</div>
			{props.previousUser && props.previousCharacter && <div>
				<h5>Previous</h5>
				<div>{props.previousUser.name}</div>
				<div>{`(${props.previousCharacter.value})${props.previousCharacter.name}`}</div>
			</div>}
			<FlatButton
				label="Toggle Sort"
				icon={<IconFilterList />}
				onTouchTap={props.onToggleDraftFilter}
			/>
			<ol style={draftListStyle}>
				{props.characters.map(c => (
					<DraftCharacter
						key={c.uuid}
						drafting={props.drafting}
						leftUserUuid={props.leftUserUuid}
						rightUserUuid={props.rightUserUuid}
						character={c}
						onDraftCharacter={props.onDraftCharacter}
					/>
				))}
			</ol>
		</div>
	);
}

Draft.propTypes = {
	characters: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
	completedPicks: PropTypes.number,
	totalPicks: PropTypes.number,
	onToggleDraftFilter: PropTypes.func.isRequired,
	onDraftCharacter: PropTypes.func.isRequired,
	drafting: PropTypes.bool,
	leftUserUuid: PropTypes.string,
	rightUserUuid: PropTypes.string,
	previousUser: PropTypes.object,
	previousCharacter: PropTypes.object
};
