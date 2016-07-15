import React, { PropTypes, Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import DraggableInspectCharacter from './draggable-inspect-character';


class InspectContainer extends Component {
	constructor(props) {
		super(props);
		this.moveCharacter = this.moveCharacter.bind(this);
	}

	static propTypes = {
		characters: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
		updateInspectState: PropTypes.func.isRequired,
		userUuid: PropTypes.string.isRequired
	};

	render () {
		return (
			<div>
			{
				this.props.characters.map((character, i, thisArray) => {
					return (
						<DraggableInspectCharacter
							key={character.matchUuid}
							id={character.matchUuid}
							name={character.name}
							value={character.value}
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
		const character = characters.filter(c => c.matchUuid === id)[0];
		const hoverCharacter = characters.filter(c => c.matchUuid === hoverId)[0];
		const characterIndex = characters.indexOf(character);
		const hoverIndex = characters.indexOf(hoverCharacter);

		const stateWithCharacterSpliced = [...characters.slice(0, characterIndex), ...characters.slice(characterIndex + 1)];
		const stateWithCharacterMoved = [...stateWithCharacterSpliced.slice(0, hoverIndex), character, ...stateWithCharacterSpliced.slice(hoverIndex)];

		this.props.updateInspectState({
			userUuid: this.props.userUuid,
			state: stateWithCharacterMoved
		});
	}
}

export default DragDropContext(HTML5Backend)(InspectContainer);
