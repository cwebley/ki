import React, { PropTypes, Component } from 'react';
import Paper from 'material-ui/Paper';
import flow from 'lodash.flow';
import { DragSource, DropTarget } from 'react-dnd';
import { ItemTypes } from '../constants';
import intToStreak from 'int-to-streak';
import { heatingUp, onFire } from '../styles.css';

class InspectCharacter extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		connectDragSource: React.PropTypes.func.isRequired,
		connectDropTarget: React.PropTypes.func.isRequired,
		isDragging: React.PropTypes.bool.isRequired,
		value: React.PropTypes.number.isRequired
	};

	render () {
		let streakClass = '';
		if (this.props.streak === 2) {
			streakClass = heatingUp;
		}
		if (this.props.streak >= 3) {
			streakClass = onFire;
		}

		return this.props.connectDragSource(this.props.connectDropTarget(
			<div style={this.getStyles()}>
				<Paper style={{
					height: '100%',
					overflow: 'hidden',
					whiteSpace: 'nowrap',
					display: 'flex',
					justifyContent: 'space-around',
					alignItems: 'center'
				}} className={streakClass} >
					<span style={{fontWeight: '500', fontSize: '1.5em'}}>
						{this.props.value || '?'}
					</span>
					<h4 style={{flexShrink: '2'}}>{this.props.name}</h4>
					{<span style={{fontWeight: '500', fontSize: '1.5em'}}>
						{intToStreak(this.props.streak)}
					</span>
					}
				</Paper>
			</div>
		));
	}

	getStyles () {
		const styles = {
			border: '1px dashed gray',
			cursor: 'move',
			height: '4em'
		};

		if (this.props.isDragging) {
			styles.opacity = 0;
		}
		return styles;
	}
}

const dropTarget = {
	hover (props, monitor) {
		const draggedItem = monitor.getItem();
		if (draggedItem.userUuid !== props.userUuid) {
			return;
		}
		if (draggedItem.id !== props.id) {
			props.moveCharacter(draggedItem.id, props.id);
		}
	}
};

const dragSource = {
	beginDrag (props) {
		return {
			id: props.id,
			userUuid: props.userUuid
		};
	}
};
const connect = (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging()
});
const collect = (connect) => ({
	connectDropTarget: connect.dropTarget()
});

export default flow(
	DragSource(ItemTypes.DRAGGABLE_INSPECT_CHARACTER, dragSource, connect),
	DropTarget(ItemTypes.DRAGGABLE_INSPECT_CHARACTER, dropTarget, collect)
)(InspectCharacter);
