var React = require('react'),
	Router = require('react-router'),
	AuthStore = require('../stores/auth-store'),
	api = require('../utils/api'),
	TournamentStore = require('../stores/tournament-store'),
	Link = Router.Link,
	CharacterCard = require('../components/character-card');

var TournamentPage = React.createClass({
	mixins: [ Router.Navigation, Router.State ],

	statics: {
		willTransitionTo: function (transition) {
			if (!AuthStore.loggedIn()) {
				transition.redirect('/login');
			}
		}
	},
	getInitialState: function(){
		return {};
	},
	componentWillMount:function(){
		TournamentStore.addChangeListener(this._onChange);
	},
	componentWillUnmount:function(){
		TournamentStore.removeChangeListener(this._onChange);
	},
	componentDidMount: function(){
		api.getTournamentData(this.getParams().titleSlug);
	},
	_onChange: function(){
		this.setState({
			me: TournamentStore.getMe(),
			them: TournamentStore.getThem()
		});
	},
	submitGame: function(event,data){
		console.log("SUBMIT GAME: ", event, data)
	},
	renderCharacters: function(user){
		var characters = user.characters.map(function(character){
			return <CharacterCard data={character} key={user.name + '-' + character.id} />;
		});
		return(
			<div className="character-wrapper">
				{characters}
			</div>
		);
	},
	renderUser: function(user){
		if(!user){
			return false;
		}
		var characterCards = this.renderCharacters(user);
		return (
			<div className="player-wrapper">
				<h2 className="name">{user.name}</h2>
				<div className="next" onClick={this.submitGame}>{user.next[0]}</div>
				<ul className="user-stats">
					<li className="stat-item score">
						score: {user.score}
					</li>
					<li className="stat-item record">
						record: {user.wins} - {user.losses}
					</li>
					<li className="stat-item streak">
						streak: {user.curStreak}
					</li>
				</ul>
				{characterCards}
			</div>
		);
	},
	render: function(){
		var titleSlug = this.getParams().titleSlug;
		var me = this.renderUser(this.state.me);
		var them = this.renderUser(this.state.them);

		return (
			<div className="page-wrap">
				<h1 className="title">{titleSlug}</h1>
				<div className="me">
					{me}
				</div>
				<div className="versus">VS</div>
				<div className="them">
					{them}
				</div>
			</div>
		);
	}
});

module.exports = TournamentPage;