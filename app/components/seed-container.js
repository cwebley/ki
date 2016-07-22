import React, { PropTypes, Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import DraggableCharacter from './draggable-character';

class SeedContainer extends Component {
	constructor(props) {
		super(props);
		this.moveCharacter = this.moveCharacter.bind(this);
	}

	static propTypes = {
		characters: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
		maxStartingValue: PropTypes.number.isRequired,
		updateSeeds: PropTypes.func.isRequired
	};

	render () {
		return (
			<div>
			{
				this.props.characters.map((character, i, thisArray) => {
					return (
						<DraggableCharacter
							key={character.uuid}
							id={character.uuid}
							name={character.name}
							draftCharacter={!!character.users}
							value={Math.floor((i * this.props.maxStartingValue) / thisArray.length) + 1}
							moveCharacter={this.moveCharacter}
						/>
					);
				})
			}
			</div>
		);
	}

	moveCharacter (id, hoverId) {
		const { characters } = this.props;
		const character = characters.filter(c => c.uuid === id)[0];
		const hoverCharacter = characters.filter(c => c.uuid === hoverId)[0];
		const characterIndex = characters.indexOf(character);
		const hoverIndex = characters.indexOf(hoverCharacter);

		const stateWithCharacterSpliced = [...characters.slice(0, characterIndex), ...characters.slice(characterIndex + 1)];
		const stateWithCharacterMoved = [...stateWithCharacterSpliced.slice(0, hoverIndex), character, ...stateWithCharacterSpliced.slice(hoverIndex)];

		this.props.updateSeeds(stateWithCharacterMoved);
	}
}

export default DragDropContext(HTML5Backend)(SeedContainer);
