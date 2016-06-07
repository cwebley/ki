import React, { PropTypes } from 'react';
import Checkbox from 'material-ui/Checkbox';

export default React.createClass({
	dispayName: 'check',

	propTypes: {
		name: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		defaultChecked: PropTypes.bool
	},

	contextTypes: {
		formName: PropTypes.string.isRequired,
		update: PropTypes.func.isRequired,
		values: PropTypes.object.isRequired
	},

	componentWillMount () {
		// check its state from the store. if nothing is found it means that
		// this is the first time this checkbox has rendered and we can respect the defaultChecked prop
		if (this.props.defaultChecked && this.context.values[this.props.name] === undefined) {
			this.updateValue(this.props.defaultChecked);
		}
	},

	updateValue (value) {
		this.context.update(this.context.formName, this.props.name, value);
	},

	onCheck (e) {
		this.updateValue(e.target.checked);
	},

	render () {
		return (
			<div>
				<Checkbox
					label="Character"
					checked={this.context.values[this.props.name] || false}
					onCheck={this.onCheck}
				/>
			</div>
		);
	}
});
