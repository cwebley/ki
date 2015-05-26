var React = require('react');

var Header = React.createClass({

	render:function(){
		return(
			<header>
				<ul>
					<li href="">Home</li>
					<li href="">Tournaments</li>
					<li href="">Stats</li>
					<li href="">FAQ</li>
				</ul>
				<div>Login</div>
			</header>
		);
	}
})

module.exports = Header;