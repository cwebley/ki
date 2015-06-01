var React = require('react'),
	Router = require('react-router'),
	RouteHandler = Router.RouteHandler,
	AuthStore = require('../stores/auth-store'),
	serverActions = require('../actions/server-action-creators'),
	TournamentListStore = require('../stores/tournament-list-store')
	Link = Router.Link;

var TournamentIndex = React.createClass({
	mixins: [ Router.Navigation ],

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
			<div className="tournaments">
				<ol className="master">
				{
					this.state.tournaments.map(function(t){
						return (
							<li key={t.id}>
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