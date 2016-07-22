import React, { PropTypes } from 'react';
import Toggle from 'material-ui/Toggle';

export default React.createClass({
	displayName: 'formListToggle',

	propTypes: {
		name: PropTypes.string,
		label: PropTypes.string
	},

	contextTypes: {
		isFormValid: PropTypes.func.isRequired,
		toggleListItems: PropTypes.func.isRequired,
		registerToggle: PropTypes.func.isRequired,
		values: PropTypes.object.isRequired
	},

	getDefaultProps () {
		return {
			name: 'toggle-all',
			label: 'Toggle All'
		};
	},

	componentWillMount () {
		this.context.registerToggle(this.props.name);
	},

	onToggle (e) {
		this.context.toggleListItems(e.target.checked);
	},

	render () {
		return (
			<div>
				<Toggle
					label={this.props.label}
					toggled={!!this.context.values[this.props.name]}
					onToggle={this.onToggle}
				/>
			</div>
		);
	}
});
