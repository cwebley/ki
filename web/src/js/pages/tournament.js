var React = require('react'),
	Router = require('react-router'),
	serverActions = require('../actions/server-action-creators'),
	viewActions = require('../actions/view-action-creators'),
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
			them: TournamentStore.getThem(),
			undoStatus: TournamentStore.undoStatus(),
			supreme: false
		};
	},
	componentWillMount:function(){
		TournamentStore.addChangeListener(this._onChange);
	},
	componentWillUnmount:function(){
		TournamentStore.removeChangeListener(this._onChange);
	},
	componentDidMount: function(){
		viewActions.focusTournament(this.getParams().titleSlug);
		serverActions.getTournamentData(this.getParams().titleSlug);
	},
	componentWillReceiveProps: function(){
		serverActions.getTournamentData(this.getParams().titleSlug);
	},
	_onChange: function(){
		if(React.findDOMNode(this.refs.supreme)){
			React.findDOMNode(this.refs.supreme).checked = false;
		}
		this.setState({
			me: TournamentStore.getMe(),
			them: TournamentStore.getThem(),
			undoStatus: TournamentStore.undoStatus(),
			supreme: false
		});
	},
	renderCharacters: function(user){
		if(!user.characters){
			return false;
		}
		var characters = user.characters.map(function(character){
			return (
				<li className="character-wrapper" key={user.name + '-' + character.id}>
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
			losingCharacter: this.state.them.next[0],
			supreme: this.state.supreme
		};
		var TheyWin = {
			slug: this.getParams().titleSlug,
			losingPlayer: this.state.me.name,
			losingCharacter: this.state.me.next[0],
			winningPlayer: this.state.them.name,
			winningCharacter: this.state.them.next[0],
			supreme: this.state.supreme
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
				<div className="checkbox">
					<label>
						<input type="checkbox" value="" ref="supreme" onClick={this.toggleSupreme}/>
						Supreme Victory
					</label>
				</div>
				<Link to="inspect" params={{titleSlug: this.getParams().titleSlug}}>
					<button className="btn btn-primary btn-sm btn-block">Inspect</button>
				</Link>
			</div>
		);
	},
	renderSeedButton: function(){
		return (
			<Link to="seed" params={{titleSlug: this.getParams().titleSlug}}>
				<button className="btn btn-lg btn-block btn-primary btn-danger">Seed</button>
			</Link>
		);

	},
	deleteTournament: function() {
		if(!confirm("Are you sure you want to completely erase this tournament?")){
			return;
		}
		// TODO this should probably be a viewaction first which calls a serveraction
		serverActions.deleteTournament(this.getParams().titleSlug);
		this.transitionTo('/');
	},
	undoLastGame: function() {
		if(!confirm("Are you sure you want to undo the last game?")){
			return;
		}
		serverActions.undoLastGame(this.getParams().titleSlug);
	},
	toggleSupreme: function(){
		var supreme = !this.state.supreme;
		this.setState({
			supreme: supreme
		});
	},
	render: function(){
		var me = this.renderUser(this.state.me);
		var them = this.renderUser(this.state.them);
		var middle = (!this.state.them.seeded) ? this.renderSeedButton() : this.renderMatchup();

		var undoClasses = ['btn','btn-xs','undo-last'];
		var undoColor = 'btn-default';
		if(this.state.undoStatus.attempt){
			undoColor = ('btn-danger');
		}
		if(this.state.undoStatus.attempt && this.state.undoStatus.success){
			undoColor = ('btn-success');
		}
		undoClasses.push(undoColor);
		
		return (
			<div className="page-wrap">
				<div className="column-left">
					{me}
					<footer>
						<button className={undoClasses.join(' ')} onClick={this.undoLastGame}>Undo Last Game</button>
					</footer>
				</div>
				<div className="column-center">
					{middle}
				</div>
				<div className="column-right">
					{them}
					<footer>
						<a className="delete-tournament" onClick={this.deleteTournament}>{"Delete " + this.getParams().titleSlug}</a>
					</footer>
				</div>
			</div>
		);
	}
});

module.exports = TournamentPage;