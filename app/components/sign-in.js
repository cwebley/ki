import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Form from './form';
import Text from './text';
import SubmitButton from './submit-button';
import * as actions from '../actions/forms';
import get from 'lodash.get';

const formName = "signin";

export default class SignIn extends Component {
	render () {
		return (
			<div className="page">
				<h1>Sign In</h1>
				<Form
					values={this.props.values}
					formName={formName}
					update={this.props.update}
					reset={this.props.reset}
					onSubmit={(data) => this.onSubmit(data)}
				>
					<Text
						name="username"
						validate={['required']}
						label="Username"
						placeholder="KeitsPlz2016"
					/>
					<Text
						name="password"
						validate={['required', 'passwordLength']}
						type="password"
						label="Password"
					/>
					<SubmitButton />
				</Form>
			</div>
		);
	}

	onSubmit (data) {
		this.props.signInUser(data, formName);
	}
}

SignIn.propTypes = {
	signInUser: PropTypes.func.isRequired,
	values: PropTypes.object,
};

SignIn.displayName = formName;

const mapStateToProps = (state) => ({
	values: get(state.forms, formName + '.values', {})
});

export default connect(mapStateToProps, actions)(SignIn);
