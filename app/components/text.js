import React, { PropTypes } from 'react';
import TextField from 'material-ui/TextField';
import * as validators from '../validators/forms';

export default React.createClass({
	dispayName: 'text',

	propTypes: {
		name: PropTypes.string.isRequired,
		placeholder: PropTypes.string,
		label: PropTypes.string,
		validate: PropTypes.arrayOf(PropTypes.string),
		type: PropTypes.string
	},

	contextTypes: {
		formName: PropTypes.string.isRequired,
		update: PropTypes.func.isRequired,
		values: PropTypes.object.isRequired,
		registerValidation: PropTypes.func.isRequired
	},

	getDefaultProps () {
		return {
			validate: [],
			type: 'text'
		};
	},

	getInitialState () {
		return {
			errors: []
		};
	},

	// register validation with the parent form and call the unregister func at unmount time
	componentWillMount () {
		this.removeValidationFromContext = this.context.registerValidation(
			show => this.isValid(show)
		);
	},

	componentWillUnmount () {
		this.removeValidationFromContext();
	},

	updateValue (value) {
		this.context.update(this.context.formName, this.props.name, value);

		// if this field is currently displaying errors, validate on each change
		// so that the error disappears immediately if the value is changed to something valid
		if (this.state.errors.length) {
			setTimeout(() => this.isValid(true), 0);
		}
	},

	onChange (e) {
		this.updateValue(e.target.value);
	},

	isValid (showErrors) {
		const errors = this.props.validate.reduce(
			(displayedErrors, currentName) =>
				displayedErrors.concat(validators[currentName](this.context.values[this.props.name])
			), []
		);

		if (showErrors) {
			this.setState({
				errors
			});
		}

		return !errors.length;
	},

	onBlur () {
		this.isValid(true);
	},

	render () {
		return (
			<div>
				<TextField
					hintText={this.props.placeholder}
					floatingLabelText={this.props.label}
					value={this.context.values[this.props.name] || ''}
					type={this.props.type}
					onChange={this.onChange}
					onBlur={this.onBlur}
					errorText={this.state.errors.length ? (
						<div>
							{this.state.errors.map((error) => <div key={error.id}>{error.msg}</div>)}
						</div>
					) : null}
				/>
			</div>
		);
	}
});
