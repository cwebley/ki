import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions/forms';
import get from 'lodash.get';

export default React.createClass({
	displayName: 'Form',

	propTypes: {
		formName: PropTypes.string.isRequired,
		children: PropTypes.node,
		values: PropTypes.object.isRequired,
		update: PropTypes.func.isRequired,
		reset: PropTypes.func.isRequired,
		onSubmit: PropTypes.func
	},

	getDefaultProps () {
		return {
			values: {}
		}
	},

	childContextTypes: {
		formName: PropTypes.string,
		update: PropTypes.func,
		reset: PropTypes.func,
		submit: PropTypes.func,
		values: PropTypes.object,
		registerValidation: PropTypes.func,
		isFormValid: PropTypes.func
	},

	validations: [],

	// adds a reference of the validating function to the array (used when Text component is mounted)
	// and returns another function removing the same reference from the register
	registerValidation (isValidFunc) {
		this.validations = [...this.validations, isValidFunc];
		return this.removeValidation.bind(null, isValidFunc);
	},

	removeValidation (refForRemoval) {
		this.validations = this.validations.filter(v => v !== refForRemoval);
	},

	// checks registered validation functions and returns true or false.
	// This method is also injected into the context, so all nested components can check if the form is valid or not
	isFormValid (showErrors) {
		return this.validations.reduce(
			(validStatus, isValidFunc) => isValidFunc(showErrors) && validStatus, true
		);
	},

	submit () {
		if (this.isFormValid(true)) {
			this.props.onSubmit(Object.assign({}, this.props.values));
			this.props.reset(this.props.formName);
		}
	},

	getChildContext () {
		return {
			formName: this.props.formName,
			update: this.props.update,
			reset: this.props.reset,
			submit: this.submit,
			values: this.props.values,
			registerValidation: this.registerValidation,
			isFormValid: this.isFormValid
		}
	},

	render () {
		return (
			<form>
				{this.props.children}
			</form>
		);
	}
});
