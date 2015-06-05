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
			previous: SeedStore.getPrevious(),
			status: SeedStore.getPrevious()
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
			previous: SeedStore.getPrevious(),
			status: SeedStore.getStatus()
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
						streak={character.bestStreak} />
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
	renderCenterColumn: function(){
		if(!this.state.theirStats.characters || !this.state.theirStats.characters.length){
			return false;
		}

		var description;
		if(this.state.status.attempt && this.state.status.success){
			description = "green"
		}
		if(this.state.status.attempt && !this.state.status.success){
			description = "red"
		}

		var fields = this.state.theirStats.characters.map(function(character){
			return (
				<input className={"seed-field " + description} 
					type="text" 
					key={'input-'+character.name} 
					placeholder={character.name + '-' + character.value} 
					ref={character.name} />
			);
		});
		return(
			<div className="column-center">
			<h2 className="column-title">{'Seed Up'}</h2>
				{fields}
				<button className="btn btn-block btn-primary" onClick={this.submitSeeds}>Submit Seeds</button>
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
						streak={character.curStreak} />
				</li>
			);
		});
		return(
			<div className="column-right">
				<h2 className="column-title">{'Current Opponent Data'}</h2>
				<ol className="character-list">
					{characters}
				</ol>
			</div>
		);
	},
	submitSeeds: function(){
		var data = {
			opponent: this.state.theirStats.name
		};
		this.state.theirStats.characters.forEach(function(c){
			data[c.name] = this.refs[c.name].getDOMNode().value
		}.bind(this));

		serverActions.submitSeeds(this.getParams().titleSlug, data);
	},
	render: function(){
		var leftColumn = this.renderLeftColumn();
		var middleColumn = this.renderCenterColumn();
		var rightColumn = this.renderRightColumn();

		return (
			<div className="page-wrap">
				<h1 className="title left-arrow">
					<Link to="tournament" params={{titleSlug: this.getParams().titleSlug}}>
						{'Back to ' + this.getParams().titleSlug}
					</Link>
				</h1>
					{leftColumn}
					{middleColumn}
					{rightColumn}
			</div>
		);
	}
});

module.exports = SeedPage;