var React = require('react'),
	Router = require('react-router'),
	serverActions = require('../actions/server-action-creators'),
	TournamentStore = require('../stores/tournament-store'),
	Link = Router.Link,
	update = require('React/lib/update'),
	DragContainer = require('../components/drag-card-container');


var InspectPage = React.createClass({
	displayName: 'InspectPage',
	mixins: [ Router.Navigation, Router.State ],

	getInitialState: function(){
		return {
			me: TournamentStore.inspectMe(),
			them: TournamentStore.inspectThem(),
			status: TournamentStore.inspectStatus()
		};
	},
	componentWillMount:function(){
		TournamentStore.addChangeListener(this._onChange);
	},
	componentDidMount: function(){
		serverActions.getInspect(this.getParams().titleSlug);

		this.intervalId = setInterval(function(){
			serverActions.getInspect(this.getParams().titleSlug);
		}.bind(this),5000)
	},
	componentWillUnmount:function(){
		TournamentStore.removeChangeListener(this._onChange);
		clearInterval(this.intervalId);
	},
	_onChange: function(){
		var newState = {
			me: TournamentStore.inspectMe(),
			them: TournamentStore.inspectThem(),
			status: TournamentStore.inspectStatus()
		};

		this.setState(newState);
		setTimeout(function(){
			this.setState(update(this.state,{
				status: {
					$set: TournamentStore.inspectStatus()
				}
			}));
		}.bind(this),3000)
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
	},
	renderLeftColumn: function() {
		var characters = this.state.me.upcoming.map(function(c,i){
			return {
				id: i,
				name: c.name,
				value: c.value,
				wins: c.wins,
				losses: c.losses,
				streak: c.curStreak,
			};
		});

		return (
			<div className="column-left">
				<h2 className="column-title">Me</h2>
				<DragContainer ref="containerMe" cards={characters} who="me"/>
			</div>
		);
	},
	renderCenterColumn: function() {
		submitInspectButtonColor = 'btn-primary';
		if(this.state.status.attempt){
			submitInspectButtonColor = 'btn-danger';
		}
		if(this.state.status.success){
			submitInspectButtonColor = 'btn-success';
		}
		var btnClasses = ['btn','btn-lg',submitInspectButtonColor];

		var leftMatch = this.state.me.current;
		var rightMatch = this.state.them.current;
		return(
			<div className="column-center">
				<h2>Current Match</h2>
				<div className="matchup">
					<div className="matchup-left">
						<h2>{leftMatch}</h2>
					</div>
					<div className="versus">VS</div>
					<div className="matchup-right">
						<h2>{rightMatch}</h2>
					</div>
				</div>
				<button className={btnClasses.join(' ')} onClick={this.postInspection}>Submit Matchups</button>
			</div>
		);
	},
	renderRightColumn: function() {
		var characters = this.state.them.upcoming.map(function(c,i){
			return {
				id: i,
				name: c.name,
				value: c.value,
				wins: c.wins,
				losses: c.losses,
				streak: c.curStreak,
			};
		});

		return (
			<div className="column-right">
				<h2 className="column-title">The Other Guy</h2>
				<DragContainer ref="containerThem" cards={characters} who="them"/>
			</div>
		);
	},
	postInspection: function(){
		if(!this.state.me.name || !this.state.them.name){
			return
		}

		var data = {
			matchups: {}
		}
		data.matchups[this.state.me.name] = this.refs.containerMe.refs.child.state.cards.map(function(card){
			return card.name
		});
		data.matchups[this.state.them.name] = this.refs.containerThem.refs.child.state.cards.map(function(card){
			return card.name
		});

		console.log("YOURE SENDING THIS DATA: ", data)
		serverActions.postInspection(this.getParams().titleSlug, data);
	},
});

module.exports = InspectPage;
