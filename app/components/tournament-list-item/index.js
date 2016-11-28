import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import intToStreak from 'int-to-streak';

import { usersContainer, userdata, username } from './styles.css';

export default function tournamentListItem (props) {
	return (
		<TableRow>
			<TableRowColumn>
				<Link to={`/${props.slug}`}>
					<span>{props.name}</span>
				</Link>
			</TableRowColumn>
			<TableRowColumn>
				<span>{props.goal}</span>
			</TableRowColumn>
			<TableRowColumn>
				<span>{`${props.active}`}</span>
			</TableRowColumn>
			<TableRowColumn>
				<span>{props.championUuid ? props.users.ids[props.championUuid].name : ''}</span>
			</TableRowColumn>
			<TableRowColumn>
				<div className={usersContainer}>
					<div className={userdata}>
						<div className={username}>{props.users.ids[props.users.result[0]].name}</div>
						<div>{`${props.users.ids[props.users.result[0]].score} pts`}</div>
						<div>{`${props.users.ids[props.users.result[0]].wins}-${props.users.ids[props.users.result[0]].losses}`}</div>
						{props.users.ids[props.users.result[0]].bestStreak && <div>
							{intToStreak(props.users.ids[props.users.result[0]].bestStreak)}
						</div>}
					</div>
					<div className={userdata}>
						<div className={username}>{props.users.ids[props.users.result[1]].name}</div>
						<div>{`${props.users.ids[props.users.result[1]].score} pts`}</div>
						<div>{`${props.users.ids[props.users.result[1]].wins}-${props.users.ids[props.users.result[1]].losses}`}</div>
						{props.users.ids[props.users.result[1]].bestStreak && <div>
							{intToStreak(props.users.ids[props.users.result[1]].bestStreak)}
						</div>}
					</div>
				</div>
			</TableRowColumn>
		</TableRow>
	);
}

tournamentListItem.propTypes = {
	slug: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	goal: PropTypes.number.isRequired,
	active: PropTypes.bool.isRequired,
	championUuid: PropTypes.string,
	users: PropTypes.object.isRequired
};
