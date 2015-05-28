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
			<div>
				<header>
					<ul>
						<li><Link to="about">Home</Link></li>
						<li><Link to="tournaments">Tournaments</Link></li>
						<li><Link to="stats">Stats</Link></li>
						<li><Link to="faq">FAQ</Link></li>
					</ul>
					{
						(this.state.loggedIn) ? <a onClick={this.logout}>Log Out</a> : <Link to="login">Log In</Link>
					}
				</header>

			  <RouteHandler/>
			</div>
		);
	}
});

module.exports = App;