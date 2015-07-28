var React = require('react');

var CharacterCard = React.createClass({
	displayName: 'CharacterCard',
	propTypes: {
		name: React.PropTypes.string,
		value: React.PropTypes.number,
		wins: React.PropTypes.number,
		losses: React.PropTypes.number,
		streak: React.PropTypes.number,
		clickButton: React.PropTypes.func,
		upClick: React.PropTypes.func,
		downClick: React.PropTypes.func
	},

	render: function(){
		var topClass = ['character']
		if(this.props.streak === 2){
			topClass.push('heating');
		}
		if(this.props.streak >=3){
			topClass.push('fire');
		}
		var btnClass = (this.props.clickButton) ? 'character-button' : 'hide';
		var downArrowClass = (this.props.downClick) ? 'down-arrow' : 'hide';
		var upArrowClass = (this.props.upClick) ? 'up-arrow' : 'hide';
		console.log("THIS PROPS downClick: ", this.props.downClick)
		var streakText = '';
		if(this.props.streak > 0){
			streakText = this.props.streak + 'W'
		}
		if(this.props.streak < 0){
			streakText = -1* this.props.streak + 'L'
		}

		return (
			<div className={topClass.join(' ')}>
			  <div className="card-left-column">

			    <div className="value-wrapper">
			      <button className={upArrowClass}></button>
			      <div className="value">
			        <span className="value-text">{this.props.value}</span>
			      </div>
			      <button className={downArrowClass} onClick={this._downArrowClick}></button>
			    </div>
			    <div className="character-info">
			      <h3 className="character-name">{this.props.name}</h3>
			      <div className="record">{this.props.wins} - {this.props.losses}</div>
			    </div>

			  </div>
			  <div className="card-right-column">
			  <span className="streak">{streakText}</span>
			  </div>
			  <div className="card-center-column">
			    <button className={btnClass} onClick={this._onClick}>Choose</button>
			  </div>
			</div>
		);
	},
	_onClick: function(){
		this.props.clickButton(this.props.name);
	},
	_downArrowClick: function(){
		this.props.downClick(this.props.name);
	}
});

module.exports = CharacterCard;