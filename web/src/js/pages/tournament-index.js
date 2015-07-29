var React = require('react'),
	Router = require('react-router'),
	RouteHandler = Router.RouteHandler,
	AuthStore = require('../stores/auth-store'),
	serverActions = require('../actions/server-action-creators'),
	TournamentListStore = require('../stores/tournament-list-store')
	Link = Router.Link;

var TournamentIndex = React.createClass({
	mixins: [ Router.Navigation ],

	statics: {
		willTransitionTo: function (transition) {
			if (!AuthStore.loggedIn()) {
				transition.redirect('/login');
			}
		}
	},
	getInitialState: function(){
		return {
			tournaments: []
		};
	},
	componentWillMount:function(){
		TournamentListStore.addChangeListener(this._onChange);
	},
	componentWillUnmount:function(){
		TournamentListStore.removeChangeListener(this._onChange);
	},
	componentDidMount: function(){
		serverActions.getTournamentIndex();
		// poll index somewhat infrequently
		setInterval(function(){
			serverActions.getTournamentIndex();
		},30000)
	},
	_onChange: function(){
		this.setState({
			tournaments: TournamentListStore.get()
		});
	},
	createTournament: function(){
		var data = {};
		data.name = this.refs.newTitle.getDOMNode().value;
		data.goal = this.refs.newGoal.getDOMNode().value;
		data.opponent = this.refs.newOpponent.getDOMNode().value;

		serverActions.createTournament(data);
	},
	render: function(){
		return (
			<div className="tournament-list-wrapper">
				<div className="master">
					<ol className="tournament-list">
					{
						this.state.tournaments.map(function(t){
							return (
								<li className="tournament-list-item" key={t.id}>
									<Link to="tournament" params={{titleSlug: t.slug}}>{t.name}</Link>
								</li>
							)
						})
					}
					</ol>

					<input className={"new-title"} 
						type="text" 
						placeholder="New Title" 
						ref="newTitle" />
					<input className={"new-goal"} 
						type="text" 
						placeholder="Goal" 
						ref="newGoal" />
					<input className={"new-opponent"} 
						type="text" 
						placeholder="Opponent" 
						ref="newOpponent" />
					<button className="btn btn-block btn-primary" onClick={this.createTournament}>Create New</button>

				</div>
				<div className="detail">
					<RouteHandler />
				</div>
			</div>
		);
	}
});

module.exports = TournamentIndex;