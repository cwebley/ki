import React, {PropTypes, Component} from 'react';
import { Link } from 'react-router';

import HomeIcon from 'material-ui/svg-icons/action/home';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { deepOrange500 } from 'material-ui/styles/colors';
import spacing from 'material-ui/styles/spacing';

import withWidth, {MEDIUM, LARGE} from 'material-ui/utils/withWidth';

import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
//
// const muiTheme = getMuiTheme({
// 	palette: {
// 		accent1Color: deepOrange500,
// 	},
// });

class MainLayout extends Component {

	static propTypes = {
		children: PropTypes.node,
		location: PropTypes.object,
		width: PropTypes.number.isRequired
	}

	static contextTypes = {
		router: PropTypes.object.isRequired
	}

	static childContextTypes = {
		muiTheme: PropTypes.object,
	}

	getChildContext () {
		return {
			muiTheme: this.state.muiTheme
		}
	}

	state = {
		muiTheme: getMuiTheme()
	}

	getStyles () {
		const styles = {
			content: {
				margin: spacing.desktopGutter
			},
			contentWhenMedium: {
				margin: `${spacing.desktopGutter * 2}px ${spacing.desktopGutter * 3}px`,
			}
		}

		if (this.props.width === MEDIUM || this.props.width === LARGE) {
			styles.content = Object.assign(styles.content, styles.contentWhenMedium);
		}
		return styles;
	}

	render () {
		const { prepareStyles } = this.state.muiTheme;
		const styles = this.getStyles();
		const preparedStyles = prepareStyles(styles);

		return (
			<MuiThemeProvider muiTheme={this.state.muiTheme}>
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
					<main style={preparedStyles.content}>
						{ this.props.children }
					</main>
				</div>
			</MuiThemeProvider>
		);
	}
}

export default withWidth()(MainLayout);
