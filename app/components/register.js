import React, { PropTypes } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Form from './form';
import Text from './text';
import SubmitButton from './submit-button';
import get from 'lodash.get';

import * as actions from '../actions/forms';

import { connect } from 'react-redux';
import { Link } from 'react-router';

const formName = 'register';

class Register extends React.Component {
	static displayName = formName

	static propTypes = {
		registerUser: PropTypes.func.isRequired,
		values: PropTypes.object,
	}

	static contextTypes = {
		router: PropTypes.object.isRequired
	}

	render () {
		return (
			<div className="page">
				<h1>Register</h1>
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
						name="email"
						validate={['required', 'email']}
						label="Email"
						placeholder="teach.me.rico@ki-lessons.com"
					/>
					<Text
						name="password"
						validate={['required', 'passwordLength']}
						type="password"
						label="Password"
					/>
					<Text
						name="confirmPassword"
						validate={['required', 'passwordLength']}
						type="password"
						label="Confirm Password"
					/>
					<SubmitButton />
				</Form>
				<Link to="/sign-in" activeClassName="active-route">Already registered? Log in here.</Link>
			</div>
		);
	}

	onSubmit (data) {
		this.props.registerUser(data, formName)
			// redirect to the home page if registration was successful
			.then(
				action => {
					if (action.token) {
						this.context.router.push('/')
					}
				}
			);
	}
}

const mapStateToProps = (state) => ({
	values: get(state.forms, formName + '.values', {})
});

export default connect(mapStateToProps, actions)(Register);
