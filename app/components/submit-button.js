import React, { PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';

export default React.createClass({
	displayName: 'submitButton',

	propTypes: {
		label: PropTypes.string
	},

	contextTypes: {
		isFormValid: PropTypes.func.isRequired,
		submit: PropTypes.func.isRequired
	},

	getDefaultProps () {
		return {
			label: 'Submit'
		};
	},

	render () {
		return (
			<div>
				<RaisedButton
					primary
					disabled={!this.context.isFormValid()}
					label={this.props.label}
					onTouchTap={this.context.submit}
				/>
			</div>
		);
	}
});
