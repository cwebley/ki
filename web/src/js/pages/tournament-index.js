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
	},
	_onChange: function(){
		this.setState({
			tournaments: TournamentListStore.get()
		});
	},
	render: function(){
		return (
			<div className="tournament-list-wrapper">
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
				<div className="detail">
					<RouteHandler />
				</div>
			</div>
		);
	}
});

module.exports = TournamentIndex;