import React, { PropTypes } from 'react';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import Form from './form';
import Text from './text';
import SubmitButton from './submit-button';

import * as actions from '../actions/forms';

import { connect } from 'react-redux';

const fieldStyles = {
	display: 'block'
}

class Register extends React.Component {
	render () {
		console.log("THIK>SPROSP: ", this.props)

		return (
			<div className="page">
				<Form onSubmit={(data) => this.onSubmit(data)}>
					<Text
						name="username"
						validate={['required']}
						label="Username"
						placeholder="KeitsPlz2016"
					/>
					<Text
						name="email"
						validate={['required', 'email']}
						label="Email"
						placeholder="teach.me.rico@ki-lessons.com"
					/>
					<Text
						name="password"
						validate={['required']}
						type="password"
						label="Password"
					/>
					<Text
						name="confirmPassword"
						validate={['required']}
						type="password"
						label="Confirm Password"
					/>
					<SubmitButton />
				</Form>
			</div>
		);
	}

	onSubmit (data) {
		console.log("SUBMITTING FORM: ", data);
		this.props.registerUser(data);
	}
}

Register.propTypes = {
	registerUser: PropTypes.func.isRequired
};

export default connect(state => state, actions)(Register);
