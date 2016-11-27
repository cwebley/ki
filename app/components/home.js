import React from 'react';
import { Link } from 'react-router';

const Home = React.createClass({
	render: function () {
		return (
			<div className="page">
				<h1>Killer Instinct</h1>
				<p>The Tournament Of Champions</p>

				<Link to="/tournaments"><span>Tournaments</span></Link>
			</div>
		);
	}
});

export default Home;
