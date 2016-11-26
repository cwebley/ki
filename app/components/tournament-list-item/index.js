import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { TableRow, TableRowColumn } from 'material-ui/Table';

import { usersContainer, userdata, username, userscore } from './styles.css';

export default function tournamentListItem (props) {
	return (
		<TableRow>
			<TableRowColumn>
				<Link to={`/${props.slug}`}>
					<span>{props.name}</span>
				</Link>
			</TableRowColumn>
			<TableRowColumn>{props.goal}</TableRowColumn>
			<TableRowColumn>{props.active}</TableRowColumn>
			<TableRowColumn>{props.champion ? props.users.ids[props.championUuid] : ''}</TableRowColumn>
			<TableRowColumn className={usersContainer}>
				<div className={userdata}>
				<div className={username}>{props.users.ids[props.users.result[0]].name}</div>
					<div className={userscore}>{props.users.ids[props.users.result[0]].score}</div>
				</div>
				<div className={userdata}>
					<div className={username}>{props.users.ids[props.users.result[1]].name}</div>
					<div>{props.users.ids[props.users.result[1]].score}</div>
				</div>
			</TableRowColumn>
		</TableRow>
	);
}

tournamentListItem.propTypes = {
	slug: React.PropTypes.string.isRequired,
	name: React.PropTypes.string.isRequired,
	goal: React.PropTypes.number.isRequired,
	active: React.PropTypes.bool.isRequired,
	championUuid: React.PropTypes.string.isRequired,
	users: React.PropTypes.object.isRequired
};
