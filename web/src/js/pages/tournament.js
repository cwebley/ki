var React = require('react'),
	Router = require('react-router'),
	AuthStore = require('../stores/auth-store'),
	serverActions = require('../actions/server-action-creators'),
	TournamentStore = require('../stores/tournament-store'),
	TournamentListStore = require('../stores/tournament-list-store'),
	Link = Router.Link,
	CharacterCard = require('../components/character-card'),
	MatchupItem = require('../components/matchup-item');

var TournamentPage = React.createClass({
	mixins: [ Router.Navigation, Router.State ],

	getInitialState: function(){
		return {
			me: TournamentStore.getMe(),
			them: TournamentStore.getThem()
		};
	},
	componentWillMount:function(){
		TournamentStore.addChangeListener(this._onChange);
	},
	componentWillUnmount:function(){
		TournamentStore.removeChangeListener(this._onChange);
		TournamentListStore.setCurrent(this.getParams().titleSlug);
	},
	componentDidMount: function(){
		serverActions.getTournamentData(this.getParams().titleSlug);
	},
	componentWillReceiveProps: function(){
		serverActions.getTournamentData(this.getParams().titleSlug);
	},
	_onChange: function(){
		this.setState({
			me: TournamentStore.getMe(),
			them: TournamentStore.getThem()
		});
	},
	renderCharacters: function(user){
		if(!user.characters){
			return false;
		}
		var characters = user.characters.map(function(character){
			return (
				<li className="character-wrapper" key={user.name + '-' + character.id}>
					<CharacterCard data={character} />
				</li>
			)
		});
		return(
			<ol className="character-list">
				{characters}
			</ol>
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
	renderMatchup: function(){
		if(!this.state.me.next){
			return false;
		}

		// TODO supreme
		var IWin = {
			slug: this.getParams().titleSlug,
			winningPlayer: this.state.me.name,
			winningCharacter: this.state.me.next[0],
			losingPlayer: this.state.them.name,
			losingCharacter: this.state.them.next[0]
		};
		var TheyWin = {
			slug: this.getParams().titleSlug,
			losingPlayer: this.state.me.name,
			losingCharacter: this.state.me.next[0],
			winningPlayer: this.state.them.name,
			winningCharacter: this.state.them.next[0]
		};

		return(
			<div className="matchup">
				<div className="matchup-left">
					<MatchupItem data={IWin} display={this.state.me.next[0]} />
				</div>
				<div className="versus">VS</div>
				<div className="matchup-right">
					<MatchupItem data={TheyWin} display={this.state.them.next[0]} />
				</div>
			</div>
		);
	},
	render: function(){
		var titleSlug = this.getParams().titleSlug;
		var me = this.renderUser(this.state.me);
		var them = this.renderUser(this.state.them);
		var matchup = this.renderMatchup();

		return (
			<div className="page-wrap">
				<h1 className="title">{titleSlug}</h1>

				<div className="column-left">
					{me}
				</div>
				<div className="column-center">
					{matchup}
				</div>
				<div className="column-right">
					{them}
				</div>
			</div>
		);
	}
});

module.exports = TournamentPage;