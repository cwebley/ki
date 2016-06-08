import React, { PropTypes } from 'react';
import Checkbox from 'material-ui/Checkbox';

export default React.createClass({
	dispayName: 'check',

	propTypes: {
		name: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		defaultChecked: PropTypes.bool,
		disabled: PropTypes.bool
	},

	contextTypes: {
		formName: PropTypes.string.isRequired,
		update: PropTypes.func.isRequired,
		values: PropTypes.object.isRequired,

		// if this is a child of FormList, we need this data register with its parent and to update
		listName: PropTypes.string,
		registerWithList: PropTypes.func
	},

	componentWillMount () {
		// check its state from the store. if nothing is found it means that
		// this is the first time this checkbox has rendered and we can respect the defaultChecked prop
		if (this.props.defaultChecked && this.context.values[this.props.name] === undefined) {
			this.updateValue(this.props.defaultChecked);
		}
	},
	componentWillMount () {
		this.unregisterWithList = this.context.registerWithList(this.props.name);
	},

	componentWillUnmount () {
		this.unregisterWithList();
	},

	updateValue (value) {
		this.context.update({
			formName: this.context.formName,
			name: this.props.name,
			listName: this.context.listName,
			value
		});
	},

	onCheck (e) {
		this.updateValue(e.target.checked);
	},

	render () {
		return (
			<div>
				<Checkbox
					label={this.props.label}
					checked={!!this.context.values[this.props.name]}
					onCheck={this.onCheck}
					disabled={this.props.disabled}
				/>
			</div>
		);
	}
});
