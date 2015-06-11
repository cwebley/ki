var React = require('react');

var CharacterCard = React.createClass({
	displayName: 'CharacterCard',
	propTypes: {
		name: React.PropTypes.string,
		value: React.PropTypes.number,
		wins: React.PropTypes.number,
		losses: React.PropTypes.number,
		streak: React.PropTypes.number
	},

	render: function(){
		return (
			<div className="character">
				<div className="card-left-column">
					<h3 className="character-name">{this.props.name}</h3>
				</div>
				<div className="card-right-column">
					<ul className="character-stats">
						<li className="char-stat-item value">
							value: {this.props.value}
						</li>
						<li className="char-stat-item record">
							record: {this.props.wins} - {this.props.losses}
						</li>
						<li className="char-stat-item streak">
							streak: {this.props.streak}
						</li>
					</ul>
				</div>
			</div>
		);
	}
});

module.exports = CharacterCard;