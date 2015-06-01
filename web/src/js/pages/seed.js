var React = require('react'),
	Router = require('react-router'),
	AuthStore = require('../stores/auth-store'),
	serverActions = require('../actions/server-action-creators'),
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
			them: TournamentStore.getThem()
		};
	},
	componentWillMount:function(){
		TournamentStore.addChangeListener(this._onChange);
	},
	componentWillUnmount:function(){
		TournamentStore.removeChangeListener(this._onChange);
	},
	componentDidMount: function(){
		serverActions.getTournamentIndex();
	},
	_onChange: function(){
		this.setState({
			me: TournamentStore.getMe(),
			them: TournamentStore.getThem()
		});
	},
	render: function(){
		var titleSlug = this.getParams().titleSlug;
		var me = this.renderUser(this.state.me);
		var them = this.renderUser(this.state.them);
		var matchup = this.renderMatchup();

		return (
			<div className="page-wrap">
				<h1 className="title">{titleSlug}</h1>
				<div className="me">
					{me}
				</div>
				{matchup}
				<div className="them">
					{them}
				</div>
			</div>
		);
	}
});

module.exports = SeedPage;