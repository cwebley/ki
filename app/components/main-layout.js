import React from 'react';
import { Link } from 'react-router';

import HomeIcon from 'material-ui/lib/svg-icons/action/home';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';

import { deepOrange500 } from 'material-ui/lib/styles/colors';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';

import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/lib/toolbar';
import IconButton from 'material-ui/lib/icon-button';
import RaisedButton from 'material-ui/lib/raised-button';
import FlatButton from 'material-ui/lib/flat-button';

const muiTheme = getMuiTheme({
	palette: {
		accent1Color: deepOrange500,
	},
});

const MainLayout = React.createClass({

	propTypes: {
		children: React.PropTypes.node,
	},

	getStyles: function () {
		const styles = {
			appBar: {
			}
		}

		return styles;
	},

	render: function () {
		const styles = this.getStyles();
		return (
			<MuiThemeProvider muiTheme={muiTheme}>
				<div className="app">
					<header className="primary-header">
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
						</Toolbar>
					</header>
					<main>
						{ this.props.children }
					</main>
				</div>
			</MuiThemeProvider>
		);
	}
});

export default MainLayout;
