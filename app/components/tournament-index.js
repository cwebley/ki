import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import TournamentListItem from './tournament-list-item/index.js';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';

import fetchTournamentIndex from '../actions/fetch-tournament-index';
import { getMe, getTournamentIndexFromState } from '../store';

class TournamentIndex extends Component {
	static displayName = 'tournamentIndex';

	static propTypes = {
		tournaments: PropTypes.array
	};

	static defaultProps = {
		tournaments: []
	};

	static contextTypes = {
		router: PropTypes.object.isRequired
	};

	componentDidMount () {
		this.props.fetchTournamentIndex(this.props.me.token);
	}

	render () {
		return (
			<div className="page">
				<h1>Tournament Index</h1>
				<Table>
					<TableHeader displaySelectAll={false} adjustForCheckbox={false}>
						<TableRow>
							<TableHeaderColumn>Name</TableHeaderColumn>
							<TableHeaderColumn>Goal</TableHeaderColumn>
							<TableHeaderColumn>In Progress?</TableHeaderColumn>
							<TableHeaderColumn>Champion</TableHeaderColumn>
							<TableHeaderColumn>Data</TableHeaderColumn>
						</TableRow>
					</TableHeader>
					<TableBody displayRowCheckbox={false}>
					{this.props.tournaments.map(t =>
						<TournamentListItem
							key={t.uuid}
							name={t.name}
							slug={t.slug}
							goal={t.goal}
							active={t.active}
							championUuid={t.championUuid}
							users={t.users}
						/>
					)}
					</TableBody>
				</Table>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	tournaments: getTournamentIndexFromState(state),
	me: getMe(state)
});

export default connect(mapStateToProps, {fetchTournamentIndex})(TournamentIndex);
