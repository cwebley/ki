var React = require('react'),
	Router = require('react-router'),
	RouteHandler = Router.RouteHandler,
	Link = Router.Link,
	AuthWatch = require('../mixins/auth-watch'),
	AuthStore = require('../stores/auth-store.js'),
	ViewActionCreators = require('../actions/view-action-creators');

var App =
  React.createClass({

	mixins: [ AuthWatch ],

	contextTypes: {
		router: React.PropTypes.func.isRequired
	},
	getInitialState: function(){
		return {
			loggedIn: AuthStore.loggedIn()
		};
	},
	logout:function(){
		ViewActionCreators.logout();
	},
	render:function(){
		return (
			<div className="app">
				<header className="header">
					<Link className="header-link" to="about">Home</Link>
					<Link className="header-link" to="tournaments">Tournaments</Link>
					<Link className="header-link" to="stats">Stats</Link>
					<Link className="header-link" to="faq">FAQ</Link>
					
					{
						(this.state.loggedIn) ? <a className="header-link" onClick={this.logout}>Log Out</a> : <Link className="header-link" to="login">Log In</Link>
					}
				</header>

			  <RouteHandler/>
			</div>
		);
	}
});

module.exports = App;