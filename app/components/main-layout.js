import React from 'react';
import { Link } from 'react-router';

import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import { deepOrange500 } from 'material-ui/lib/styles/colors';
import RaisedButton from 'material-ui/lib/raised-button';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';

const muiTheme = getMuiTheme({
	palette: {
		accent1Color: deepOrange500,
	},
});

const MainLayout = React.createClass({

	getInitialState: function () {
		return {
			open: false
		};
	},

	handleTouchTap: function () {
		this.setState({
			open: true
		});
	},

	handleRequestClose: function () {
		this.setState({
			open: false
		});
	},

	render: function () {
		const standardActions = (
			<FlatButton
				label="Okey"
				secondary={true}
				onTouchTap={this.handleRequestClose}
			/>
		);

		return (
			<MuiThemeProvider muiTheme={muiTheme}>
				<div className="app">
					<header className="primary-header"></header>
					<Dialog
						open={this.state.open}
						title="Super Secret Password"
						actions={standardActions}
						onRequestClose={this.handleRequestClose}
					>
					1-2-3-4-5
					</Dialog>
					<aside className="primary-aside">
						<ul>
							<li><Link to="/" activeClassName="active">Home</Link></li>
							<li><Link to="/something-else" activeClassName="active">Something Else</Link></li>
						</ul>
					</aside>
					<RaisedButton
						label="Super Secret Password"
						primary={true}
						onTouchTap={this.handleTouchTap}
					/>
					<main>
						{ this.props.children }
					</main>
				</div>
			</MuiThemeProvider>
		);
	}
});

export default MainLayout;
