var React = require('react'),
	Router = require('react-router'),
	auth = require('../utils/auth');

var LoginPage = React.createClass({

	mixins: [ Router.Navigation ],

	statics: {
	 	willTransitionFrom: function (transition, element) {
			if (element.refs.username.getDOMNode().value !== '' || element.refs.password.getDOMNode().value !== '') {
	 			if (!confirm('You have unsaved information, are you sure you want to leave this page?')) {
	    			transition.abort();
	    		}
	    	}
	    },
	    attemptedTransition: null
	},

	getInitialState: function(){
		return {
			errors: {}
		};
	},

	handleSubmit: function(e){
		e.preventDefault();
		var data = {
			username: this.refs.username.getDOMNode().value,
			password: this.refs.password.getDOMNode().value
		};

		// clear nodes before transitioning to prevent window confirm box popup
		this.refs.username.getDOMNode().value = '';
		this.refs.password.getDOMNode().value = '';

		auth.login(data);

		// this.transitionTo('/');
	},

	render: function(){
		return (
			<div>
				<form onSubmit={this.handleSubmit}>
					<div className="form-header">
						<h1>Log In</h1>
					</div>
					<div className="form-body">
						<label>Username</label>
						<input type="text" ref="username" />
						<label>Password</label>
						<input type="password" ref="password" />
					</div>
					<div className="form-footer">
						<button type="submit" className="btn btn-primary btn-block">Submit</button>
					</div>
				</form>
			</div>
		);
	}
});

module.exports = LoginPage;