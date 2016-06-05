import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';


import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import HomeIcon from 'material-ui/svg-icons/action/home';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';


class Header extends Component {
	render () {
		return (
			<Toolbar>
				<ToolbarGroup
					float="left"
				>
					<FlatButton
						containerElement={<Link to="/" activeClassName="active-route" />}
						linkButton={true}
						label="Home"
						icon={<HomeIcon />}
					/>
				</ToolbarGroup>
				{ this.renderHeaderActions() }
			</Toolbar>
		);
	}

	renderHeaderActions () {
		console.log("ME? ", this.props)

		if (this.props.me && this.props.me.name) {
			return (
				<ToolbarGroup
					float="right"
				>
					<ToolbarTitle text={this.props.me.name} />
					<RaisedButton label="Create Tournament" primary={true} />
					<ToolbarSeparator />
					<FlatButton
						onTouchTap={this.logout}
						label="Logout"
					/>
				</ToolbarGroup>
			);
		}
		return (
			<ToolbarGroup
				float="right"
			>
				<ToolbarSeparator />
				<RaisedButton label="Create Tournament" primary={true} />
				<ToolbarSeparator />
				<FlatButton
					containerElement={<Link to="/sign-in" activeClassName="active-route" />}
					linkButton={true}
					label="Sign In"
				/>
				<FlatButton
					containerElement={<Link to="/register" activeClassName="active-route" />}
					linkButton={true}
					label="Register"
				/>
			</ToolbarGroup>
		);
	}

	logout () {
		console.log('logout');
	}
}

const mapStateToProps = (state) => ({
	me: state.me || {}
});

export default connect(mapStateToProps)(Header);
