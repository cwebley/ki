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
			data: {}
		};
	},
	componentWillMount:function(){
		TournamentStore.addChangeListener(this._onChange);
	},
	componentWillUnmount:function(){
		TournamentStore.removeChangeListener(this._onChange);
	},
	componentDidMount: function(){
		api.getTournamentData(this.getParams().title);
	},
	_onChange: function(){
		this.setState({
			data: TournamentStore.get()
		});
	},
	render: function(){
		var title = this.getParams().title;
		return (
			<div>
				<h1>{title}</h1>
				{this.state.data}
			</div>
		);
	}
});

module.exports = TournamentPage;