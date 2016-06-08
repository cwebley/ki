import React, { PropTypes } from 'react';
import Toggle from 'material-ui/Toggle';

export default React.createClass({
	displayName: 'formListToggle',

	propTypes: {
		label: PropTypes.string
	},

	contextTypes: {
		isFormValid: PropTypes.func.isRequired,
		toggleListItems: PropTypes.func.isRequired
	},

	getDefaultProps () {
		return {
			label: 'Toggle All'
		};
	},

	onToggle (e) {
		this.context.toggleListItems(e.target.checked);
	},

	render () {
		return (
			<div>
				<Toggle
					label={this.props.label}
					onToggle={this.onToggle}
				/>
			</div>
		);
	}
});
