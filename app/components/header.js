import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';


import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import HomeIcon from 'material-ui/svg-icons/action/home';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

import logout from '../actions/logout';


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
		if (this.props.me && this.props.me.name) {
			return (
				<ToolbarGroup
					float="right"
				>
					<ToolbarTitle text={this.props.me.name} />
					<RaisedButton
						label="Create Tournament" primary={true}
						linkButton={true}
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
				float="right"
			>
				<FlatButton
					containerElement={<Link to="/register" activeClassName="active-route" />}
					linkButton={true}
					label="Register"
				/>
				<FlatButton
					containerElement={<Link to="/sign-in" activeClassName="active-route" />}
					linkButton={true}
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
	me: state.me || {}
});

export default connect(mapStateToProps, { logout })(Header);
