import React, { PropTypes, Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import spacing from 'material-ui/styles/spacing';
import withWidth, {MEDIUM, LARGE} from 'material-ui/utils/withWidth';

import Header from './header';

class MainLayout extends Component {
	static displayName = 'MainLayout'
	static propTypes = {
		children: PropTypes.node,
		location: PropTypes.object,
		width: PropTypes.number.isRequired
	}

	static childContextTypes = {
		muiTheme: PropTypes.object
	}

	getChildContext () {
		return {
			muiTheme: this.state.muiTheme
		};
	}

	state = {
		muiTheme: getMuiTheme()
	};

	getStyles () {
		const styles = {
			content: {
				padding: spacing.desktopGutter,
				overflow: 'auto',
				position: 'relative'
			},
			contentWhenMedium: {
				padding: `${spacing.desktopGutter * 2}px ${spacing.desktopGutter * 3}px`,
				overflow: 'auto',
				position: 'relative'
			}
		};

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
						<Header />
					</header>
					<main style={preparedStyles.content}>
						{this.props.children}
					</main>
				</div>
			</MuiThemeProvider>
		);
	}
}

export default withWidth()(MainLayout);
