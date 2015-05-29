var React = require('react'),
	Router = require('react-router'),
	AuthStore = require('../stores/auth-store'),
	api = require('../utils/api'),
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
		api.getTournamentIndex();
	},
	_onChange: function(){
		this.setState({
			tournaments: TournamentListStore.get()
		});
	},
	render: function(){
		return (
			<div>
				<ol>
				{
					this.state.tournaments.map(function(t){
						return (
							<li key={t.id}>
								<Link to="tournament" params={{title: t.name}}>{t.name}</Link>
							</li>
						)
					})
				}
				</ol>
			</div>
		);
	}
});

module.exports = TournamentIndex;