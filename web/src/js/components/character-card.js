var React = require('react');

var TournamentPage = React.createClass({
	propTypes: {
		data: React.PropTypes.object
	},

	render: function(){
		var data = this.props.data;
		return (
			<div className="character">
				<div className="card-left-column">
					<h3 className="character-name">{data.name}</h3>
				</div>
				<div className="card-right-column">
					<ul className="character-stats">
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
			</div>
		);
	}
});

module.exports = TournamentPage;