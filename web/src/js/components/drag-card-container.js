var React = require('React'),
	update = require('React/lib/update'),
	DragCard = require('./draggable-card'),
	DragDropContext = require('react-dnd').DragDropContext,
	HTML5Backend = require('react-dnd/modules/backends/HTML5');


	// propTypes: {
	// 	cards: React.PropTypes.arrayOf(
	// 		React.PropTypes.object.isRequired
	// 	).isRequired
	// },

var DragCardContainer = React.createClass({
	displayName:'DragCardContainer',

	getInitialState: function(){
		return {
			cards: [{
        id: 1,
        text: 'Orchid'
      }, {
        id: 2,
        text: 'Glacius'
      }, {
        id: 3,
        text: 'Kanra'
      }, {
        id: 4,
        text: 'Jago'
      }, {
        id: 5,
        text: 'Fulgore'
      }, {
        id: 6,
        text: 'Aganos'
      }, {
        id: 7,
        text: 'Wulf'
      }]
		};
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
			<div style={{width:400}}>
			{
				this.state.cards.map(function(card){
					return (
						<DragCard 
							key={card.id}
							id={card.id}
							text={card.text}
							moveCard={this.moveCard} />
					);
				}.bind(this))
			}
			</div>
		);
	}
});

module.exports = DragDropContext(HTML5Backend)(DragCardContainer);