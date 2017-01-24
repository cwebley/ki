import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { VictoryBar, VictoryLine, VictoryChart, VictoryAxis, VictoryGroup, VictoryScatter, VictoryTheme, VictoryVoronoiTooltip, VictoryTooltip } from 'victory';
import fetchTournamentStats from '../actions/fetch-tournament-stats';
import { getMe, getTournamentStatsFromState } from '../store';

class TournamentStats extends Component {
	static displayName = 'tournamentStats';

	static propTypes = {
		stats: PropTypes.object,
		me: PropTypes.object
	};

	componentDidMount () {
		this.props.fetchTournamentStats(this.props.params.tournamentSlug, this.props.me.token);
	}

	render () {
		console.log('PROPS: ', this.props);
		let firstUserWins = [];
		let secondUserWins = [];

		if (this.props.stats.games) {
			firstUserWins = this.props.stats.games.result
				.filter(gUuid => this.props.stats.games.ids[gUuid].winningUserUuid === this.props.stats.users.result[0])
				.map(gUuid => this.props.stats.games.ids[gUuid]);
			secondUserWins = this.props.stats.games.result
				.filter(gUuid => this.props.stats.games.ids[gUuid].winningUserUuid === this.props.stats.users.result[1])
				.map(gUuid => this.props.stats.games.ids[gUuid]);
		}
		return (
			<div className="page">
				<h1>Tournament Stats</h1>
				{this.props.stats.games && <VictoryChart
					>
					<VictoryAxis
						dependentAxis
						label="Game Value"
					/>
					<VictoryAxis
						label="Game Number"
					/>
					<VictoryBar
						labels={
							(game) => `${this.props.stats.users.ids[game.winningUserUuid].name}'s ${this.props.stats.users.ids[game.winningUserUuid].characters.ids[game.winningCharacterUuid].name}`
						}
						labelComponent={<VictoryTooltip/>}
						data={this.props.stats.games.result.map(gUuid => this.props.stats.games.ids[gUuid])}
						y="value"
					/>
				</VictoryChart>}
				{this.props.stats.games && <VictoryChart
						theme={VictoryTheme.material}
					>
					<VictoryAxis
						dependentAxis
						// style={{
						// 	axisLabel: {fontSize: 16, padding: 20},
						// }}
						padding={50}
					/>
					<VictoryAxis
					/>
					{firstUserWins.length >= 2 && <VictoryGroup
						data={firstUserWins}
						y="winningUserCumulativeScore"
						x="gameNumber"
					>
						<VictoryLine
							label={this.props.stats.users.ids[this.props.stats.users.result[0]].name}
						/>
						<VictoryScatter />
					</VictoryGroup>}
					{secondUserWins.length >=2 && <VictoryGroup
						data={secondUserWins}
						y="winningUserCumulativeScore"
						x="gameNumber"
					>
						<VictoryLine
							label={this.props.stats.users.ids[this.props.stats.users.result[1]].name}
						/>
						<VictoryScatter />
					</VictoryGroup>}
					{this.props.stats.games.result.length && <VictoryVoronoiTooltip
						style={{
							labels: {fontSize: 7},
						}}
						size={15}
						labels={(game) => `${this.props.stats.users.ids[game.winningUserUuid].characters.ids[game.winningCharacterUuid].name} vs ${this.props.stats.users.ids[game.losingUserUuid].characters.ids[game.losingCharacterUuid].name}`}
						data={this.props.stats.games.result.map(gUuid => this.props.stats.games.ids[gUuid])}
						x="gameNumber"
						y="winningUserCumulativeScore"
					/>}
				</VictoryChart>}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	stats: getTournamentStatsFromState(state, ownProps.params.tournamentSlug),
	me: getMe(state)
});

export default connect(mapStateToProps, { fetchTournamentStats })(TournamentStats);
