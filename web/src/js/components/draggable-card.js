var React = require('react'),
	DragDropContext = require('react-dnd').DragDropContext,
	DragSource = require('react-dnd').DragSource,
	DropTarget = require('react-dnd').DropTarget,
	HTML5Backend = require('react-dnd/modules/backends/HTML5').HTML5Backend,
	flow = require('lodash.flow'),
	ItemTypes = require('../constants/dnd-constants').ItemTypes;

var cardSource = {
	beginDrag: function(props){
		return {
			id: props.id
		};
	},
	endDrag: function(props,monitor,component){
		props.dropCard();
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
		name: React.PropTypes.string.isRequired,
		value: React.PropTypes.number,
		wins: React.PropTypes.number,
		losses: React.PropTypes.number,
		streak: React.PropTypes.number,
		moveCard: React.PropTypes.func.isRequired,
		dropCard: React.PropTypes.func.isRequired,
	},

	render: function(){
		var topClass = ['character', 'drag-card'];
		if(this.props.isDragging){
			topClass.push('dragging');
		}

		if(this.props.streak === 2){
			topClass.push('heating');
		}
		if(this.props.streak >=3){
			topClass.push('fire');
		}
		var btnClass = (this.props.clickButton) ? 'character-button' : 'hide';
		var streakText = '';
		if(this.props.streak > 0){
			streakText = this.props.streak + 'W'
		}
		if(this.props.streak < 0){
			streakText = -1* this.props.streak + 'L'
		}

		return this.props.connectDragSource(this.props.connectDropTarget(
			<div className={topClass.join(' ')}>
			  <div className="card-left-column">

			    <div className="value-wrapper">
			      <div className="value">
			        <span className="value-text">{this.props.value}</span>
			      </div>
			    </div>
			    <div className="character-info">
			      <h3 className="character-name">{this.props.name}</h3>
			      <div className="record">{this.props.wins} - {this.props.losses}</div>
			    </div>

			  </div>
			  <div className="card-right-column">
			  <span className="streak">{streakText}</span>
			  </div>
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
