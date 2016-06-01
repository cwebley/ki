import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions/forms';

const noop = () => undefined;

const Form = React.createClass({
	displayName: 'Form',

	propTypes: {
		children: PropTypes.node,
		values: PropTypes.object,
		update: PropTypes.func,
		reset: PropTypes.func,
		onSubmit: PropTypes.func
	},

	childContextTypes: {
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
			this.props.reset();
		}
	},

	getChildContext () {
		return {
			update: this.props.update,
			reset: this.props.reset,
			submit: this.submit,
			values: this.props.values,
			registerValidation: this.registerValidation,
			isFormValid: this.isFormValid
		}
	},

	render () {
		console.log("FORM PROPS: ", this.props	)
		return (
			<form>
				{this.props.children}
			</form>
		);
	}
});

const mapStateToProps = (state) => {
	return {
		values: state.values
	};
}
export default connect(mapStateToProps, actions)(Form)
