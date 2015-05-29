var React = require('react'),
	Router = require('react-router'),
	AuthStore = require('../stores/auth-store'),
	api = require('../utils/api'),
	TournamentListStore = require('../stores/tournament-list-store');

var TourneyPage = React.createClass({
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
						return <li key={t.id}>{t.name}</li>
					})
				}
				</ol>
			</div>
		);
	}
});

module.exports = TourneyPage;