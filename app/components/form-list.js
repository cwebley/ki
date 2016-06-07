import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions/forms';
import get from 'lodash.get';

export default React.createClass({
	displayName: 'FormList',

	propTypes: {
		listName: PropTypes.string.isRequired,
		children: PropTypes.node,
		formState: PropTypes.object.isRequired,
		updateList: PropTypes.func.isRequired,
	},

	childContextTypes: {
		// override update and values for any children wrapped by this component
		update: PropTypes.func.isRequired,
		values: PropTypes.object.isRequired,

		// add a listName context prop for the child's dispatch data
		listName: PropTypes.string
	},

	getChildContext () {
		return {
			update: this.props.updateList,
			values: this.props.formState[this.props.listName] || {},
			listName: this.props.listName
		}
	},

	render () {
		return (
			<div>
				{this.props.children}
			</div>
		);
	}
});
