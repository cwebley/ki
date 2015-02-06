var React = require('react');

var Header = React.createClass({

	getInitialState:function(){
		return {title: 'Test-Tournament'} // read from store
	},
	render:function(){
		return(
			<div className="row">
			<div className="col-sm-6"><h1>{this.state.title}</h1></div>

			<div className="col-sm-2 col-sm-push-3">
				<h3>Logout</h3>
			</div>
			</div>
		)
	}
})

module.exports = Header;