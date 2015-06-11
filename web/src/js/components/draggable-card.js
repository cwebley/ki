var React = require('react'),
	DragDropContext = require('react-dnd').DragDropContext,
	DragSource = require('react-dnd').DragSource,
	DropTarget = require('react-dnd').DropTarget,
	HTML5Backend = require('react-dnd/modules/backends/HTML5').HTML5Backend,
	flow = require('lodash.flow'),
	ItemTypes = require('../constants/dnd-constants').ItemTypes;

	
var style = {
	border: '1px dashed gray',
	padding: '0.5rem 1rem',
	marginBottom: '.5rem',
	backgroundColor: 'white',
	cursor: 'move'
};

var cardSource = {
	beginDrag: function(props){
		return {
			id: props.id
		};
	}
}

var cardTarget = {
	hover: function(props, monitor){
		var draggedId = monitor.getItem().id;
		if(draggedId !== props.id){
			props.moveCard(draggedId, props.id);
		}
	}
}

var DraggableCard = React.createClass({
	displayName: 'DraggableCard',
	propTypes: {
		connectDragSource: React.PropTypes.func.isRequired,
		connectDropTarget: React.PropTypes.func.isRequired,
		isDragging: React.PropTypes.bool.isRequired,
		id: React.PropTypes.any.isRequired,
		text: React.PropTypes.string.isRequired,
		moveCard: React.PropTypes.func.isRequired
	},

	render: function(){
		return this.props.connectDragSource(this.props.connectDropTarget(
			<div style={{
					border: '1px dashed gray',
					padding: '0.5rem 1rem',
					marginBottom: '.5rem',
					backgroundColor: 'white',
					cursor: 'move'
				}}>
			{this.props.text}
			</div>
		));
	}
});

var connect = function(connect, monitor){
	return {
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging()
	};
}

var collect = function(connect){
	return {
		connectDropTarget: connect.dropTarget()
	};
}

module.exports = flow(
	DragSource(ItemTypes.DRAG_CARD, cardSource, connect),
	DropTarget(ItemTypes.DRAG_CARD, cardTarget, collect)
)(DraggableCard)
