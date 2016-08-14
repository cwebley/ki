import React, { PropTypes } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export default React.createClass({
	dispayName: 'select',

	propTypes: {
		name: PropTypes.string.isRequired,
		label: PropTypes.string,
		type: PropTypes.string,
		items: PropTypes.array.isRequired
	},

	contextTypes: {
		formName: PropTypes.string.isRequired,
		update: PropTypes.func.isRequired,
		values: PropTypes.object.isRequired,
	},

	getDefaultProps () {
		return {
			type: 'text'
		};
	},

	getInitialState () {
		return {
			errors: []
		};
	},

	componentWillMount () {
		if (this.props.defaultValue) {
			this.updateValue(this.props.defaultValue);
			return;
		}
		const defaultItem = this.props.items.filter(item => item.default)[0];
		if (defaultItem) {
			this.updateValue(defaultItem.value);
		}
	},

	componentWillUpdate (nextProps) {
		// if a new default value was passed in, make sure the store data matches the UI
		if (nextProps.defaultValue && nextProps.defaultValue !== this.props.defaultValue) {
			this.updateValue(nextProps.defaultValue);
		}
	},

	updateValue (value) {
		this.context.update({
			formName: this.context.formName,
			name: this.props.name,
			value: this.props.type === 'number' ? parseInt(value, 10) : value
		});
	},

	onChange (e, index, value) {
		this.updateValue(value);
	},

	render () {
		const defaultItem = this.props.items.filter(item => item.default)[0];

		return (
			<div>
				<SelectField
					hintText={this.props.placeholder}
					floatingLabelText={this.props.label}
					value={
						this.context.values[this.props.name] ||
						this.props.defaultValue ||
						defaultItem && defaultItem.value
					}
					onChange={this.onChange}
					maxHeight={this.props.maxHeight || 300}
				>
				{this.props.items.map(item =>
					<MenuItem
						key={item.value || item}
						value={item.value || item}
						primaryText={item.label || item}
					/>
				)}
				</SelectField>
			</div>
		);
	}
});
