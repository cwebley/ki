import React, { PropTypes, Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import DraggableCharacter from './draggable-character';


class SeedContainer extends Component {
	constructor(props) {
		super(props);
		this.moveCharacter = this.moveCharacter.bind(this);

		this.state = {
			characters: this.props.characters,
			dragActive: false
		}
	}

	static propTypes = {
		characters: React.PropTypes.arrayOf(
			React.PropTypes.object.isRequired
		).isRequired
	};

	render () {
		return (
			<div>
			{
				this.state.characters.map(function(character){
					return (
						<DraggableCharacter
							key={character.uuid}
							id={character.uuid}
							name={character.name}
							value={character.value}
							moveCharacter={this.moveCharacter}
						/>
					);
				}.bind(this))
			}
			</div>
		);
	}

	moveCharacter (id, hoverId) {
		const { characters } = this.state;
		const character = characters.filter(c => c.uuid === id)[0];
		const hoverCharacter = characters.filter(c => c.uuid === hoverId)[0];
		const characterIndex = characters.indexOf(character);
		const hoverIndex = characters.indexOf(hoverCharacter);

		const stateWithCharacterSpliced = [...this.state.characters.slice(0, characterIndex), ...this.state.characters.slice(characterIndex + 1)];
		const stateWithCharacterMoved = [...stateWithCharacterSpliced.slice(0, hoverIndex), character, ...stateWithCharacterSpliced.slice(hoverIndex)];

		this.setState({
			characters: stateWithCharacterMoved,
			dragActive: true
		});
	}
}

export default DragDropContext(HTML5Backend)(SeedContainer);
