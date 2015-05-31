var React = require('react'),
	Router = require('react-router'),
	AuthStore = require('../stores/auth-store'),
	api = require('../utils/api'),
	TournamentStore = require('../stores/tournament-store')
	Link = Router.Link;

var TournamentPage = React.createClass({
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

		};
	},
	componentWillMount:function(){
		TournamentStore.addChangeListener(this._onChange);
	},
	componentWillUnmount:function(){
		TournamentStore.removeChangeListener(this._onChange);
	},
	componentDidMount: function(){
		api.getTournamentData(this.getParams().titleSlug);
	},
	_onChange: function(){
		var data = TournamentStore.get();
		this.setState({
			next: data.next,
			seeded: data.seeded,
			slug: data.slug,
			users: data.users
		});
	},
	render: function(){
		var titleSlug = this.getParams().titleSlug;
		console.log("DATA:" , this.state)
		return (
			<div>
				<h1>{titleSlug}</h1>
				<div>
					<h2>Next Matchup</h2>
					{this.state.next}
				</div>
			</div>
		);
	}
});

module.exports = TournamentPage;