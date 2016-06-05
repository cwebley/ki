import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Form from './form';
import Text from './text';
import SubmitButton from './submit-button';
import * as actions from '../actions/forms';
import get from 'lodash.get';

const formName = "signin";

export default class SignIn extends Component {
	static displayName = formName

	static propTypes = {
		signInUser: PropTypes.func.isRequired,
		values: PropTypes.object,
	}

	static contextTypes = {
		router: PropTypes.object.isRequired
	}

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
				<Link to="/register" activeClassName="active-route">New user? Register here.</Link>
			</div>
		);
	}

	onSubmit (data) {
		this.props.signInUser(data, formName)
			// redirect to the home page if login was successful
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
	reasons: get(state.forms, formName + '.reasons'),
	values: get(state.forms, formName + '.values', {})
});

export default connect(mapStateToProps, actions)(SignIn);
