var React = require('react'),
	Router = require('react-router'),
	AuthStore = require('../stores/auth-store'),
	serverActions = require('../actions/server-action-creators'),
	SeedStore = require('../stores/seed-store'),
	TournamentStore = require('../stores/tournament-store'),
	Link = Router.Link,
	CharacterCard = require('../components/character-card'),
	MatchupItem = require('../components/matchup-item');

var SeedPage = React.createClass({
	mixins: [ Router.Navigation, Router.State ],

	statics: {
		willTransitionTo: function (transition) {
			if (!AuthStore.loggedIn()) {
				transition.redirect('/login');
			}
		}
	},
	getInitialState: function(){
		return {
			theirStats: TournamentStore.getThem(),
			previous: SeedStore.getPrevious()
		};
	},
	componentWillMount:function(){
		TournamentStore.addChangeListener(this._onChange);
		SeedStore.addChangeListener(this._onChange);
	},
	componentWillUnmount:function(){
		TournamentStore.removeChangeListener(this._onChange);
		SeedStore.removeChangeListener(this._onChange);
	},
	componentDidMount: function(){
		serverActions.getTournamentData(this.getParams().titleSlug);
		serverActions.getPreviousSeeds(this.getParams().titleSlug);
	},
	_onChange: function(){
		this.setState({
			theirStats: TournamentStore.getThem(),
			previous: SeedStore.getPrevious()
		});
	},

	// used for previous data
	renderLeftColumn: function(){
		if(!this.state.previous.stats || !this.state.previous.seeds){
			return false;
		}
		var characters = this.state.previous.seeds.map(function(character){
			return (
				<li className="character-wrapper" key={'previous-' + character.name}>
					<CharacterCard
						name={character.name}
						value={character.value}
						wins={character.wins}
						losses={character.losses}
						streak={character.bestStreak}
					/>
				</li>
			);
		});
		return(
			<div className="column-left">
				<h2 className="column-title">{this.state.previous.stats.info.name}</h2>
				<ol className="character-list">
					{characters}
				</ol>
			</div>
		);
	},

	renderRightColumn: function(){
		if(!this.state.theirStats.characters || !this.state.theirStats.characters.length){
			return false;
		}
		var characters = this.state.theirStats.characters.map(function(character){
			return (
				<li className="character-wrapper" key={'previous-' + character.name}>
					<CharacterCard
						name={character.name}
						value={character.value}
						wins={character.wins}
						losses={character.losses}
						streak={character.curStreak}
					/>
				</li>
			);
		});
		return(
			<div className="column-right">
				<h2 className="column-title">{'Seed ' + this.state.theirStats.name + '\'s characters'}</h2>
				<ol className="character-list">
					{characters}
				</ol>
			</div>
		);
	},
	render: function(){
		// var characterList = this.renderPrevious(this.state.theirStats);
		var leftColumn = this.renderLeftColumn();
		var rightColumn = this.renderRightColumn();

		console.log("THEIR STATS: ", this.state.theirStats);
		console.log("PREVIOUS: ", this.state.previous);
		return (
			<div className="page-wrap">
				<h1 className="title">{this.getParams().titleSlug}</h1>
					{leftColumn}
					{rightColumn}
			</div>
		);
	}
});

module.exports = SeedPage;