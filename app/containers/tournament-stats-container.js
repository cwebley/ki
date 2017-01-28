import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { VictoryBar, VictoryLine, VictoryChart, VictoryAxis, VictoryGroup, VictoryScatter, VictoryStack, VictoryTheme, VictoryVoronoiTooltip, VictoryTooltip } from 'victory';
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
		let firstUser;
		let secondUser;
		let firstUserWins = [];
		let secondUserWins = [];
		let firstUserCharacters = [];
		let secondUserCharacters = [];
		let firstAbbrevNameMap = {};
		let firstAbbrevNameList = [];
		let secondAbbrevNameMap = {};
		let secondAbbrevNameList = [];
		let allCharacters = [];
		let allAbbrevNameList = [];

		if (this.props.stats.games) {
			firstUser = this.props.stats.users.ids[this.props.stats.users.result[0]];
			secondUser = this.props.stats.users.ids[this.props.stats.users.result[1]];
			firstUserWins = this.props.stats.games.result
				.filter(gUuid => this.props.stats.games.ids[gUuid].winningUserUuid === firstUser.uuid)
				.map(gUuid => this.props.stats.games.ids[gUuid]);
			secondUserWins = this.props.stats.games.result
				.filter(gUuid => this.props.stats.games.ids[gUuid].winningUserUuid === secondUser.uuid)
				.map(gUuid => this.props.stats.games.ids[gUuid]);
			firstUserCharacters = firstUser.characters.result.map(cUuid => firstUser.characters.ids[cUuid]);
			secondUserCharacters = secondUser.characters.result.map(cUuid => secondUser.characters.ids[cUuid]);
			allCharacters = [...firstUserCharacters, ...secondUserCharacters];

			firstUserCharacters.forEach(c => {
				let abbreviatedName = c.name.slice(0, 3);
				if (!firstAbbrevNameMap[abbreviatedName]) {
					firstAbbrevNameMap[abbreviatedName] = true;
					firstAbbrevNameList.push(abbreviatedName);
				} else {
					abbreviatedName = c.name.slice(0, 5);
					firstAbbrevNameList.push(abbreviatedName);
				}
			});
			secondUserCharacters.forEach(c => {
				let abbreviatedName = c.name.slice(0, 3);
				if (!secondAbbrevNameMap[abbreviatedName]) {
					secondAbbrevNameMap[abbreviatedName] = true;
					secondAbbrevNameList.push(abbreviatedName);
				} else {
					abbreviatedName = c.name.slice(0, 5);
					secondAbbrevNameList.push(abbreviatedName);
				}
			});
			allAbbrevNameList = [...firstAbbrevNameList, ...secondAbbrevNameList];
		}
		return (
			<div className="page">
				<h1>Tournament Stats</h1>
				{this.props.stats.games && <div>
					<div
						style={{
							width: '50%',
							display: 'inline-block'
						}}
					>
						<Table>
							<TableHeader displaySelectAll={false} adjustForCheckbox={false}>
								<TableRow>
									<TableHeaderColumn style={{
										width: '5%'
									}}>Game</TableHeaderColumn>
									<TableHeaderColumn style={{
										width: '10%'
									}}>Winner</TableHeaderColumn>
									<TableHeaderColumn style={{
										width: '10%'
									}}>Loser</TableHeaderColumn>
									<TableHeaderColumn>Winning Character</TableHeaderColumn>
									<TableHeaderColumn>Losing Character</TableHeaderColumn>
									<TableHeaderColumn style={{
										width: '7%'
									}}>Value</TableHeaderColumn>
								</TableRow>
							</TableHeader>
							<TableBody displayRowCheckbox={false}>
							{this.props.stats.games.result.map(gUuid => {

								let rowStyles = {};
								if (this.props.stats.games.ids[gUuid].winningUserUuid === firstUser.uuid) {
									rowStyles.backgroundColor = '#DEFFDD';
								}
								if (this.props.stats.games.ids[gUuid].supreme) {
									rowStyles.border = '3px solid green';
								}

								let tableRowColumnnStyles = {
									width: '10%'
								};
								return (
									<TableRow key={gUuid}
										displayBorder
										style={rowStyles}
									>
										<TableRowColumn style={{
											width: '5%'
										}}>
											<span>{this.props.stats.games.ids[gUuid].gameNumber}</span>
										</TableRowColumn>
										<TableRowColumn style={{
											width: '10%'
										}}>
											<span>{this.props.stats.users.ids[this.props.stats.games.ids[gUuid].winningUserUuid].name}</span>
										</TableRowColumn>
										<TableRowColumn style={{
											width: '10%'
										}}>
											<span>{this.props.stats.users.ids[this.props.stats.games.ids[gUuid].losingUserUuid].name}</span>
										</TableRowColumn>
										<TableRowColumn >
											<span>{this.props.stats.users.ids[this.props.stats.games.ids[gUuid].winningUserUuid].characters.ids[this.props.stats.games.ids[gUuid].winningCharacterUuid].name}</span>
										</TableRowColumn>
										<TableRowColumn >
											<span>{this.props.stats.users.ids[this.props.stats.games.ids[gUuid].losingUserUuid].characters.ids[this.props.stats.games.ids[gUuid].losingCharacterUuid].name}</span>
										</TableRowColumn>
										<TableRowColumn style={{
											width: '7%'
										}}>
											<span>{this.props.stats.games.ids[gUuid].value}</span>
										</TableRowColumn>
									</TableRow>
								);
							})}
							</TableBody>
						</Table>
					</div>
					<div
						style={{
							width: '50%',
							display: 'inline-block'
						}}
					>
						<VictoryChart
							theme={VictoryTheme.material}
						>
							<VictoryAxis
								dependentAxis
								padding={50}
							/>
							<VictoryAxis
							/>
							{firstUserWins.length >= 2 && <VictoryLine
								data={firstUserWins}
								y="winningUserCumulativeScore"
								x="gameNumber"
								label={firstUser.name}
							/>}
							{secondUserWins.length >=2 && <VictoryLine
								data={secondUserWins}
								y="winningUserCumulativeScore"
								x="gameNumber"
								label={secondUser.name}
							/>}
							{this.props.stats.games.result.length && <VictoryScatter
								style={{
									data: {fill: "gray"},
								}}
								y="winningUserCumulativeScore"
								x="gameNumber"
								data={this.props.stats.games.result.map(gUuid => this.props.stats.games.ids[gUuid])}
							/>}
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
						</VictoryChart>
						<VictoryChart
							theme={VictoryTheme.material}
							domainPadding={20}
						>
							<VictoryAxis
								dependentAxis
							/>
							<VictoryAxis
								style={{
									tickLabels: {fontSize: 6}
								}}
								tickValues={allCharacters.map(c => c.name)}
								tickFormat={allAbbrevNameList}
							/>
							<VictoryBar
								data={
									allCharacters.map(c => ({
										...c,
										userName: firstUser.name
									}))
								}
								labels={
									(character => `${character.name}`)
								}
								labelComponent={<VictoryTooltip/>}
								x="name"
								y="cumulativeScore"
							/>
						</VictoryChart>
					</div>
				</div>}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	stats: getTournamentStatsFromState(state, ownProps.params.tournamentSlug),
	me: getMe(state)
});

export default connect(mapStateToProps, { fetchTournamentStats })(TournamentStats);
