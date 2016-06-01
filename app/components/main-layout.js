import React, {PropTypes, Component} from 'react';
import { Link } from 'react-router';

import HomeIcon from 'material-ui/svg-icons/action/home';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { deepOrange500 } from 'material-ui/styles/colors';
import spacing from 'material-ui/styles/spacing';

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

export default class MainLayout extends Component {

	static propTypes = {
		children: PropTypes.node,
		location: PropTypes.object,
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
			root: {
				paddingTop: spacing.desktopKeylineIncrement,
				minHeight: 400,
			},
			content: {
				margin: spacing.desktopGutter
			}
		}

		return styles;
	}

	render () {
		const { prepareStyles } = this.state.muiTheme;
		const styles = this.getStyles();
		const preparedStyles = prepareStyles(styles);

		console.log("TYLES: ", styles.content)

		console.log("PREPARE STYLES: ", preparedStyles.content);
		return (
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
				<main styles={preparedStyles.root}>
					<div styles={preparedStyles.content}>
						{ this.props.children }
					</div>
				</main>
			</div>
		);
	}
}
