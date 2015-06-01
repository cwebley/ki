var React = require('react'),
	Router = require('react-router'),
	AuthStore = require('../stores/auth-store'),
	api = require('../utils/api'),
	TournamentStore = require('../stores/tournament-store')
	Link = Router.Link;

var TournamentPage = React.createClass({
	propTypes: {
		data: React.PropTypes.object
	},

	render: function(){
		var data = this.props.data;
		return (
			<div className="character">
				<h3 className="characterName">{data.name}</h3>
				<ul className="characterStats">
					<li className="char-stat-item value">
						value: {data.value}
					</li>
					<li className="char-stat-item record">
						record: {data.wins} - {data.losses}
					</li>
					<li className="char-stat-item streak">
						streak: {data.curStreak}
					</li>
				</ul>
			</div>
		);
	}
});

module.exports = TournamentPage;