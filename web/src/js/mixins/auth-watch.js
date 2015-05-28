var React = require('react'),
	AuthStore = require('../stores/auth-store.js');

var AuthWatch = {


	componentWillMount:function(){
		AuthStore.addChangeListener(this._onChange)
	},
	componentWillUnmount:function(){
		AuthStore.removeChangeListener(this._onChange)
	},
	_onChange:function(){
		this.setState({loggedIn: AuthStore.loggedIn()})
	}

};

module.exports = AuthWatch;
