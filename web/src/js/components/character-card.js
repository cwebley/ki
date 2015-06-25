var React = require('react');

var CharacterCard = React.createClass({
	displayName: 'CharacterCard',
	propTypes: {
		name: React.PropTypes.string,
		value: React.PropTypes.number,
		wins: React.PropTypes.number,
		losses: React.PropTypes.number,
		streak: React.PropTypes.number,
		clickButton: React.PropTypes.func
	},

	render: function(){
		var topClass = ['character']
		if(this.props.streak === 2){
			topClass.push('heating');
		}
		if(this.props.streak >=3){
			topClass.push('fire');
		}
		var btnClasses = (this.props.clickButton) ? ['character-button', 'btn', 'btn-sm', 'btn-info'] : ['hide']

		return (
			<div className={topClass.join(' ')}>
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
				<button className={btnClasses.join(' ')} onClick={this._onClick}>Choose</button>
			</div>
		);
	},

	_onClick: function(){
		this.props.clickButton(this.props.name);
	}
});

module.exports = CharacterCard;