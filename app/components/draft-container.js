import React, { PropTypes, Component } from 'react';
import DraftCharacter from './draft-character';
import FlatButton from 'material-ui/FlatButton';
import IconFilterList from 'material-ui/svg-icons/content/filter-list';

class DraftContainer extends Component {
	constructor(props) {
		super(props);
		// this.moveCharacter = this.moveCharacter.bind(this);
	}

	static propTypes = {
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

	render () {
		return (
			<div>
				<h2>Draft it up</h2>
				<div>{`${this.props.completedPicks} / ${this.props.totalPicks}`}</div>
				{this.props.previousUser && this.props.previousCharacter && <div>
					<h5>Previous</h5>
					<div>{this.props.previousUser.name}</div>
					<div>{`(${this.props.previousCharacter.value})${this.props.previousCharacter.name}`}</div>
				</div>}
				<FlatButton
					label="Toggle Sort"
					icon={<IconFilterList />}
					onTouchTap={() => this.props.toggleDraftFilter()}
				/>
				<ol style={draftListStyle}>
					{this.props.characters.map(c => (
						<DraftCharacter
							key={c.uuid}
							drafting={this.props.drafting}
							leftUserUuid={this.props.leftUserUuid}
							rightUserUuid={this.props.rightUserUuid}
							character={c}
							onDraftCharacter={this.props.onDraftCharacter}
						/>
					))}
				</ol>
			</div>
		);
	}
}

const draftListStyle = {
	margin: 0,
	padding: '1em',
	listStyleType: 'none'
};

export default DraftContainer;
