import React, { PropTypes, Component } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { ItemTypes } from '../constants';
import flow from 'lodash.flow';

import Paper from 'material-ui/Paper';

class DraggableInspectCharacter extends Component {
	constructor(props) {
		super(props);
		this.state = {
			characters: this.props.characters,
			dragActive: false
		}
	}

	static propTypes = {
		name: PropTypes.string.isRequired,
		moveCharacter: PropTypes.func.isRequired,
		connectDragSource: React.PropTypes.func.isRequired,
		connectDropTarget: React.PropTypes.func.isRequired,
		isDragging: React.PropTypes.bool.isRequired
	};

	render () {
		return this.props.connectDragSource(this.props.connectDropTarget(
			<div style={this.getStyles()}>
				<Paper>
					<div>
						{this.props.value || '?'}
					</div>
					<div>
						<h4>{this.props.name}</h4>
					</div>
				</Paper>
			</div>
		));
	}

	getStyles () {
		const styles = {
			border: '1px dashed gray',
			cursor: 'move'
		};

		if (this.props.isDragging) {
			styles.opacity = 0;
		}
		return styles;
	}
}

const characterSource = {
	beginDrag (props) {
		return {
			id: props.id
		};
	}
}

const characterTarget = {
	hover (props, monitor) {
		const draggedId = monitor.getItem().id;
		if(draggedId !== props.id){
			props.moveCharacter(draggedId, props.id);
		}
	}
}

const connect = (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging()
});

const collect = (connect) => ({
	connectDropTarget: connect.dropTarget()
});

export default flow(
	DragSource(ItemTypes.DRAGGABLE_INSPECT_CHARACTER, characterSource, connect),
	DropTarget(ItemTypes.DRAGGABLE_INSPECT_CHARACTER, characterTarget, collect)
)(DraggableInspectCharacter)
