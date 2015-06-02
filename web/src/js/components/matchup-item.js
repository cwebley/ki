var React = require('react'),
	serverActions = require('../actions/server-action-creators'),
	api = require('../utils/api');



module.exports = React.createClass({
	propTypes:{
		data:React.PropTypes.object.isRequired,
		display:React.PropTypes.string.isRequired
	},
	submitGame: function(){
		serverActions.submitGame(this.props.data);
	},
	render: function(){
		return <button className="btn btn-lg btn-primary" onClick={this.submitGame}>{this.props.display}</button>
	}
})