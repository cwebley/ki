import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import get from 'lodash.get';

import ReasonsList from './reasons-list';

import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

import * as actions from '../actions/forms';
import Form from './form';
import Text from './text';
import Check from './check';

/*
	Example form data for /api/tournaments
	// tournament rules
	{ name: 'sibyl.org', goal: 231, opponentSlug: 'Orlo-Johnston', startCoins: 10 }

	// common character settings
	{ opponentCharacters: ['kan-ra', 'aganos', 'jago'], myCharacters: ['aganos', 'gargos', 'arbiter'] }
		** OPTIONAL and these can be repeats between users**

	// draft settings
	{ characterCountPerUser: 6 }
		**Minimum number is the user with the most characters above**
		**Maximum number allCharacters.length
	{ highestValueStart: 26 }
		**seeding will be a combination of opponent-user-characters and all in the draft. in this case seed vals will be 2-26 by twos**
	{ draftCharacters: ['spinal', fulgore', 'tj-combo', 'maya', 'hisako', 'glacius', 'tusk', 'riptor', 'thunder', 'mira'] }
		**REQUIRED unless user characters exist and their lengths are the same
		**xters here cant be in the user-characters lists**
		** must have enough characters to satisfy the character count per user
*/
const formName = 'tournamentCreator';

const styles = {
	block: {
	},
	checkbox: {
	}
};

class TournamentCreator extends Component {
	static displayName = 'tournamentCreator';

	static propTypes = {
		reasons: PropTypes.array,
		characters: PropTypes.array
	};

	state = {
		finished: false,
		stepIndex: 0,
	};

	nextStep () {
		const { stepIndex } = this.state;
		this.setState({
			stepIndex: stepIndex + 1,
			finished: stepIndex >= 2
		});
	}

	prevStep () {
		const { stepIndex } = this.state;
		if (stepIndex > 0) {
			this.setState({
				stepIndex: stepIndex - 1
			});
		}
	}

	renderForm (stepIndex) {
		let formPart;
		switch (stepIndex) {
			case 0:
				formPart = (
					<Text
						name="name"
						validate={['required']}
						label="Tournament Name"
						placeholder="Like a Rock: Behind The Ruin"
					/>
				)
				break;
			case 1:
				formPart = (
					<Check
						name="character-test"
						label="Character"
						defaultChecked
					/>
				);
				break;
			case 2:
				formPart = 'Draft rules';
				break;
			case 3:
				formPart = 'Render finished content'
				break;
			default:
				formPart = 'You shouldn\'t be here...'
		}
		return (
			<Form
				values={this.props.values}
				formName={formName}
				update={this.props.update}
				reset={this.props.reset}
				onSubmit={(data) => this.onSubmit(data)}
			>
				{formPart}
			</Form>
		);
	}

	renderStepContent () {
		const { stepIndex } = this.state;
		return (
			<div>
				{this.renderForm(stepIndex)}
				<div style={{marginTop: 12}}>
					<FlatButton
						label="Back"
						disabled={stepIndex === 0}
						onTouchTap={() => this.prevStep()}
						style={{marginRight: 12}}
					/>
					<RaisedButton
						label={stepIndex === 2 ? 'Review' : 'Next'}
						primary={true}
						onTouchTap={() => this.nextStep()}
					/>
				</div>
			</div>
		);
	}

	render () {
		return (
			<div className="page">
				<h1>Create a Tournament</h1>
				<ReasonsList reasons={this.props.reasons} />

				<div style={{width: '100%', maxWidth: 700, margin: 'auto'}}>
					<Stepper activeStep={this.state.stepIndex}>
						<Step>
							<StepLabel>Tournament Settings</StepLabel>
						</Step>
						<Step>
							<StepLabel>Common Characters</StepLabel>
						</Step>
						<Step>
							<StepLabel>Draft Settings</StepLabel>
						</Step>
					</Stepper>
					{ this.renderStepContent() }
				</div>
			</div>
		);
	}
}


const mapStateToProps = (state) => ({
	values: get(state.forms, formName + '.values', {}),
	reasons: []
});

export default connect(mapStateToProps, actions)(TournamentCreator);
