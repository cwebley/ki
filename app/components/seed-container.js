import React, { PropTypes, Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import DraggableCharacter from './draggable-character';

class SeedContainer extends Component {
	constructor (props) {
		super();
		this.moveCharacter = this.moveCharacter.bind(this);
		this.sendToBottom = this.sendToBottom.bind(this);
		this.sendToTop = this.sendToTop.bind(this);
	}

	static displayName = 'SeedContainer'

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
							draftCharacter={character.draft}
							wins={character.globalWins}
							losses={character.globalLosses}
							globalStreak={character.globalStreak}
							globalBestStreak={character.globalBestStreak}
							value={Math.floor((i * this.props.maxStartingValue) / thisArray.length) + 1}
							moveCharacter={this.moveCharacter}
							topCharacter={i === 0}
							sendToTop={this.sendToTop}
							bottomCharacter={i === thisArray.length - 1}
							sendToBottom={this.sendToBottom}
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

	sendToBottom (id) {
		const { characters } = this.props;
		const character = characters.filter(c => c.uuid === id)[0];
		const characterIndex = characters.indexOf(character);
		const stateWithCharacterMoved = [...characters.slice(0, characterIndex), ...characters.slice(characterIndex + 1), character];

		this.props.updateSeeds(stateWithCharacterMoved);
	}

	sendToTop (id) {
		const { characters } = this.props;
		const character = characters.filter(c => c.uuid === id)[0];
		const characterIndex = characters.indexOf(character);
		const stateWithCharacterMoved = [character, ...characters.slice(0, characterIndex), ...characters.slice(characterIndex + 1)];

		this.props.updateSeeds(stateWithCharacterMoved);
	}
}

export default DragDropContext(HTML5Backend)(SeedContainer);
