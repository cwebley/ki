var React = require('React'),
	update = require('React/lib/update'),
	viewActions = require('../actions/view-action-creators'),
	DragCard = require('./draggable-card'),
	DragDropContext = require('react-dnd').DragDropContext,
	HTML5Backend = require('react-dnd/modules/backends/HTML5');

var DragCardContainer = React.createClass({
	displayName:'DragCardContainer',
	propTypes: {
		cards: React.PropTypes.arrayOf(
			React.PropTypes.object.isRequired
		).isRequired,
		who: React.PropTypes.string
	},

	getInitialState: function(){
		return {
			cards: this.props.cards,
			dragActive: false
		};
	},

	componentWillReceiveProps: function(newProps){
		// While we're dragging, don't re-render unless polling picked up a significant change 
		if(this.state.dragActive && this.state.cards.length === newProps.cards.length){
			return;
		}
		this.setState(update(this.state,{
			cards: {
				$set: newProps.cards
			},
			dragActive: {
				$set: false
			}
		}));
	},

	moveCard: function(id, afterId){
		var cards = this.state.cards;

		var card = cards.filter(function(c){
			return c.id === id;
		})[0];

		var afterCard = cards.filter(function(c){
			return c.id === afterId;
		})[0];

		var cardIndex = cards.indexOf(card);
		var afterIndex = cards.indexOf(afterCard);

		this.setState(update(this.state,{
			cards: {
				$splice: [
					[cardIndex, 1],
					[afterIndex, 0, card]
				]
			},
			dragActive: {
				$set: true
			}
		}));
	},
	dropCard: function(){
		// do nothing if this isn't the inspect page
		if(!this.props.who){
			return;
		}
		// update store so current state doesn't get overridden by polling
		viewActions.rearrangeMatchups({
			matchups: this.state.cards,
			who: this.props.who
		});
	},

	render: function(){
		return (
			<div>
			{
				this.state.cards.map(function(card){
					return (
						<DragCard
							key={card.id}
							id={card.id}
							name={card.name}
							value={card.value}
							wins={card.wins}
							losses={card.losses}
							streak={card.streak}
							moveCard={this.moveCard}
							dropCard={this.dropCard} />
					);
				}.bind(this))
			}
			</div>
		);
	}
});

module.exports = DragDropContext(HTML5Backend)(DragCardContainer);