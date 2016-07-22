import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';


import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import HomeIcon from 'material-ui/svg-icons/action/home';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

import logout from '../actions/logout';

import { getMe } from '../store';

class Header extends Component {
	static displayName = "header"

	static propTypes = {
		me: PropTypes.object,
		logout: PropTypes.func.isRequired
	}

	static contextTypes = {
		router: PropTypes.object.isRequired
	}

	render () {
		return (
			<Toolbar>
				<ToolbarGroup
					style={{
						float: "left"
					}}
				>
					<FlatButton
						containerElement={<Link to="/" activeClassName="active-route" />}
						label="Home"
						icon={<HomeIcon />}
					/>
				</ToolbarGroup>
				{ this.renderHeaderActions() }
			</Toolbar>
		);
	}

	renderHeaderActions () {
		if (this.props.me && this.props.me.name) {
			return (
				<ToolbarGroup
					style={{
						float: "right"
					}}
				>
					<ToolbarTitle text={this.props.me.name} />
					<RaisedButton
						label="Create Tournament" primary={true}
						containerElement={<Link to="/create" activeClassName="active-route" />}
					/>
					<ToolbarSeparator />
					<FlatButton
						onTouchTap={() => this.onLogoutClick()}
						label="Logout"
					/>
				</ToolbarGroup>
			);
		}
		return (
			<ToolbarGroup
				style={{
					float: "right"
				}}
			>
				<FlatButton
					containerElement={<Link to="/register" activeClassName="active-route" />}
					label="Register"
				/>
				<FlatButton
					containerElement={<Link to="/sign-in" activeClassName="active-route" />}
					label="Sign In"
				/>
			</ToolbarGroup>
		);
	}

	onLogoutClick () {
		this.props.logout();

		// redirect to the sign-in page
		this.context.router.push('/sign-in');
	}
}

const mapStateToProps = (state) => ({
	me: getMe(state)
});

export default connect(mapStateToProps, { logout })(Header);
