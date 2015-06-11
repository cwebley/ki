var React = require('React'),
	update = require('React/lib/update'),
	DragCard = require('./draggable-card'),
	DragDropContext = require('react-dnd').DragDropContext,
	HTML5Backend = require('react-dnd/modules/backends/HTML5');




var DragCardContainer = React.createClass({
	displayName:'DragCardContainer',
	propTypes: {
		cards: React.PropTypes.arrayOf(
			React.PropTypes.object.isRequired
		).isRequired
	},

	getInitialState: function(){
		return {
			cards: this.props.cards
		};
	},

	componentWillReceiveProps: function(newProps){
		this.setState({
			cards: newProps.cards
		});
	},

	moveCard: function(id, afterId){
		var cards = this.state.cards;

		var card = cards.filter(function(c){
			return c.id === id
		})[0];

		var afterCard = cards.filter(function(c){
			return c.id === afterId
		})[0];

		var cardIndex = cards.indexOf(card);
		var afterIndex = cards.indexOf(afterCard);

		this.setState(update(this.state, {
			cards: {
				$splice: [
					[cardIndex, 1],
					[afterIndex, 0, card]
				]
			}
		}));
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
							moveCard={this.moveCard} />
					);
				}.bind(this))
			}
			</div>
		);
	}
});

module.exports = DragDropContext(HTML5Backend)(DragCardContainer);