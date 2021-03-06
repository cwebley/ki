import React, { PropTypes } from 'react';

export default React.createClass({
	displayName: 'FormList',

	propTypes: {
		listName: PropTypes.string.isRequired,
		children: PropTypes.node,
		formState: PropTypes.object.isRequired,
		updateList: PropTypes.func.isRequired,
		toggleListItems: PropTypes.func
	},

	contextTypes: {
		formName: PropTypes.string.isRequired
	},

	childContextTypes: {
		// override update and values for any children wrapped by this component
		update: PropTypes.func.isRequired,
		values: PropTypes.object.isRequired,

		// add a listName context prop for the child's dispatch data
		listName: PropTypes.string,
		registerWithList: PropTypes.func,
		registerToggle: PropTypes.func,
		toggleListItems: PropTypes.func
	},

	items: [],

	getChildContext () {
		return {
			update: this.props.updateList,
			values: this.props.formState[this.props.listName] || {},
			listName: this.props.listName,
			registerWithList: this.registerItem,
			registerToggle: this.registerToggle,
			toggleListItems: this.toggleListItems
		};
	},

	// register all children when they mount so that we can add a toggle all switch
	registerItem (itemName) {
		this.items = [...this.items, itemName];
		return this.unregisterItem.bind(null, itemName);
	},

	unregisterItem (nameForRemoval) {
		this.items = this.items.filter(n => n !== nameForRemoval);
	},

	registerToggle (toggleName) {
		this.toggleName = toggleName;
	},

	toggleListItems (on) {
		this.props.toggleListItems({
			formName: this.context.formName,
			toggleName: this.toggleName,
			listName: this.props.listName,
			items: [...this.items],
			on
		});
	},

	render () {
		return (
			<div>
				{this.props.children}
			</div>
		);
	}
});
