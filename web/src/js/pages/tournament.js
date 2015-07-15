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
			supreme: false,
			oddsMakerActive: false,
			oddsMakerStatus: TournamentStore.oddsMakerStatus(),
			rematchStatus: TournamentStore.rematchStatus(),
			inspect: TournamentStore.inspectOwner()
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
	render: function(){
		var me = this.renderUser(this.state.me,'me');
		var them = this.renderUser(this.state.them,'them');
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
	},
	_onChange: function(){
		if(React.findDOMNode(this.refs.supreme)){
			React.findDOMNode(this.refs.supreme).checked = false;
		}
		this.setState({
			me: TournamentStore.getMe(),
			them: TournamentStore.getThem(),
			undoStatus: TournamentStore.undoStatus(),
			supreme: false,
			oddsMakerActive: false,
			oddsMakerStatus: TournamentStore.oddsMakerStatus(),
			rematchStatus: TournamentStore.rematchStatus(),
			inspect: TournamentStore.inspectOwner()
		});
	},
	renderCharacters: function(user,who){
		if(!user.characters){
			return false;
		}
		if((who === 'me') && this.state.oddsMakerActive){
			var clickButton = this.useOddsMaker;
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
						clickButton={clickButton} />
				</li>
			);
		}.bind(this));
		return(
			<ol className="character-list">
				{characters}
			</ol>
		);
	},
	renderUser: function(user,who){
		if(!user){
			return false;
		}
		var characterCards = this.renderCharacters(user,who);
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
					<li className="stat-item power-stock">
						powers: {user.powerStock}
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

		var omButtonColor = 'btn-primary';
		if(this.state.oddsMakerStatus.attempt){
			omButtonColor = (this.state.oddsMakerStatus.success) ? 'btn-success' : 'btn-danger'
		}
		var rematchButtonColor = 'btn-primary';
		if(this.state.rematchStatus.attempt){
			rematchButtonColor = (this.state.rematchStatus.success) ? 'btn-success' : 'btn-danger'
		}

		var inspectButton = this.renderInspectButton();
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
				{inspectButton}
				{
					this.state.me.powerStock ?
					<button className={"btn btn-sm btn-block " + omButtonColor} onClick={this.toggleButtons}>Toggle OddsMaker</button> :
					<button disabled={true} className={"btn btn-sm btn-block"}>Toggle OddsMaker</button>
				}
				{
					(this.state.me.powerStock && !this.state.rematchStatus.status && this.state.me.prev)?
					<button className={"btn btn-sm btn-block " + rematchButtonColor} onClick={this.rematchClick}>
						Rematch {this.state.me.prev} vs {this.state.them.prev}
					</button> : 
					<button disabled={true} className={"btn btn-sm btn-block"}>Rematch</button>

				}
			</div>
		);
	},
	renderSeedButton: function(){
		return (
			<Link to="seed" params={{titleSlug: this.getParams().titleSlug}}>
				<button className="btn btn-lg btn-block btn-primary btn-default">Seed</button>
			</Link>
		);
	},
	renderInspectButton: function(){
		var remaining = this.state.inspect.stock

		if(!this.state.inspect.owner || (this.state.inspect.owner === this.state.them.name && remaining === 0)){
			// inspect is available to claim if you have powers available
			if(this.state.me.powerStock){
				return(
					<Link to="inspect" params={{titleSlug: this.getParams().titleSlug}}>
						<button className="btn btn-primary btn-sm btn-block">Inspect</button>
					</Link>
				);
			}
		}
		if(this.state.inspect.owner === this.state.me.name && remaining > 0){
			// if you own it and remaining > 0 you are permitted
			return(
				<Link to="inspect" params={{titleSlug: this.getParams().titleSlug}}>
					<button className="btn btn-primary btn-sm btn-block">Inspect ({remaining} left)</button>
				</Link>
			);
		}

		// they own it, or you have 0 left. disable the button
		return(
			<button disabled={true} className="btn btn-primary btn-sm btn-block">
				Inspect {(remaining || remaining === 0) ? '(' + remaining + ' left)' : ''}
			</button>
		);
	},
	deleteTournament: function() {
		if(!confirm("Are you sure you want to completely erase this tournament?")){
			return;
		}
		serverActions.deleteTournament(this.getParams().titleSlug);
		this.transitionTo('/');
	},
	undoLastGame: function() {
		if(!confirm("Are you sure you want to undo the last game?")){
			return;
		}
		serverActions.undoLastGame(this.getParams().titleSlug);
	},
	rematchClick: function(){
		serverActions.rematch(this.getParams().titleSlug);
	},
	toggleButtons: function() {
		var status = this.state.oddsMakerActive;
		this.setState({
			oddsMakerActive: !status,
			oddsMakerStatus: {
				attempt: false
			}
		});
	},
	useOddsMaker: function(character) {
		var d = {
			character: character
		}
		serverActions.useOddsMaker(this.getParams().titleSlug,d)
	},
	toggleSupreme: function(){
		var supreme = !this.state.supreme;
		this.setState({
			supreme: supreme
		});
	}
});

module.exports = TournamentPage;