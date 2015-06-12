var React = require('react'),
	Router = require('react-router'),
	serverActions = require('../actions/server-action-creators'),
	viewActions = require('../actions/view-action-creators'),
	TournamentStore = require('../stores/tournament-store'),
	Link = Router.Link,
	DragContainer = require('../components/drag-card-container');


var InspectPage = React.createClass({
	displayName: 'InspectPage',
	mixins: [ Router.Navigation, Router.State ],

	getInitialState: function(){
		return {
			me: TournamentStore.inspectMe(),
			them: TournamentStore.inspectThem(),
			status: TournamentStore.inspectStatus(),
			duration: TournamentStore.inspectDuration()
		};
	},
	componentWillMount:function(){
		TournamentStore.addChangeListener(this._onChange);
	},
	componentWillUnmount:function(){
		TournamentStore.removeChangeListener(this._onChange);
	},
	componentDidMount: function(){
		serverActions.getInspect(this.getParams().titleSlug);
	},
	_onChange: function(){
		this.setState({
			me: TournamentStore.inspectMe(),
			them: TournamentStore.inspectThem(),
			duration: TournamentStore.inspectDuration(),
			status: TournamentStore.inspectStatus(),
		});
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
		if(!this.state.me || !this.state.me.length){
			return false;
		}
		var characters = this.state.me.map(function(character,i){
			return {
				id: i,
				name: character,
			};
		});

		return (
			<div className="column-left">
				<h2 className="column-title">Me</h2>
					<DragContainer ref="containerMe" cards={characters}/>
			</div>

		);
	},
	renderCenterColumn: function() {
		var btnClasses = ['btn','btn-lg','btn-primary']

		if(this.state.status.attempt && this.state.status.success){
			btnClasses.push("btn-success")
		}
		if(this.state.status.attempt && !this.state.status.success){
			btnClasses.push("btn-danger")
		}

		return(
			<div className="column-center">
				<button className={btnClasses.join(' ')} onClick={this.postInspection}>Submit Matchups</button>
			</div>
		);
	},
	renderRightColumn: function() {
		if(!this.state.them || !this.state.them.length){
			return false;
		}
		var characters = this.state.them.map(function(character,i){
			return {
				id: i,
				name: character,
			};
		});

		return (
			<div className="column-right">
				<h2 className="column-title">The Other Guy</h2>
					<DragContainer ref="containerThem" cards={characters}/>
			</div>

		);
	},
	postInspection: function(){
		var data = {
			opponent: this.state.theirStats.name
		};

		// reach into state of child array
		data.me = this.refs.containerMe.refs.child.state.cards.map(function(card){
			return card.name
		});
		data.them = this.refs.containerThem.refs.child.state.cards.map(function(card){
			return card.name
		});

		serverActions.postInspection(this.getParams().titleSlug, data);
	},
});

module.exports = InspectPage;