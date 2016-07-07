import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import get from 'lodash.get';
import * as config from '../config';

import ReasonsList from './reasons-list';

import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

import * as formActions from '../actions/forms';
import fetchCharacters from '../actions/fetch-characters';
import createTournament from '../actions/create-tournament';
import Form from './form';
import FormList from './form-list';
import Text from './text';
import Check from './check';
import Select from './select';
import FormListToggle from './form-list-toggle';
import SubmitButton from './submit-button';

import { getMe, getCharactersFromState, getFormState } from '../store';
import { getFormValue, getListValues } from '../store/forms';

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

class TournamentCreator extends Component {
	static displayName = 'tournamentCreator';

	static propTypes = {
		characters: PropTypes.array,
		formState: PropTypes.object
	};

	static defaultProps = {
		characters: []
	};

	static contextTypes = {
		router: PropTypes.object.isRequired
	};

	state = {
		finished: false,
		stepIndex: 0,
	};

	componentDidMount () {
		this.props.fetchCharacters();
	}

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
		let formSection;
		switch (stepIndex) {
			case 0:
				formSection = this.renderRulesForm();
				break;
			case 1:
				formSection = this.renderCharactersForm();
				break;
			case 2:
				formSection = this.renderDraftForm();
				break;
			case 3:
				formSection = this.renderReview();
				break;
			default:
				formSection = 'You shouldn\'t be here...'
		}
		return (
			<Form
				values={this.props.formState.values}
				formName={formName}
				update={this.props.update}
				reset={this.props.reset}
				onSubmit={(data) => this.onSubmit(data)}
			>
				{formSection}
			</Form>
		);
	}

	renderRulesForm () {
		return (
			<div>
				<Text
					name="name"
					validate={['required']}
					label="Tournament Name"
					placeholder="Like a Rock: Behind The Ruin"
				/>
				<Select
					name="goal"
					label="Goal"
					items={config.goalValues}
					defaultValue={100}
				/>
				<Text
					name="opponentSlug"
					validate={['required']}
					label="Opponent"
					placeholder="rico"
				/>
				<Select
					name="startCoins"
					label="Starting coins"
					items={config.oneToTwentyFive}
					defaultValue={10}
				/>
			</div>
		);
	}

	renderCharactersForm () {
		const { formState } = this.props;
		const draftCharacters = getListValues(formState, 'draftCharacters');
		const opponentSlug = getFormValue(formState, 'opponentSlug') || 'Opponent';

		return (
			<div>
				<h2>{this.props.me.name}</h2>
				<FormList
					listName="myCharacters"
					formState={formState}
					updateList={this.props.updateList}
					toggleListItems={this.props.toggleListItems}
				>
				<FormListToggle />
					{this.props.characters.map(c =>
						<Check
							key={c.uuid}
							name={c.slug}
							label={c.name}
							disabled={
								//can't select this character if they're in the draft
								!!draftCharacters[c.slug]
							}
						/>
					)}
				</FormList>
				<h2>{opponentSlug}</h2>
				<FormList
					listName="opponentCharacters"
					formState={formState}
					updateList={this.props.updateList}
					toggleListItems={this.props.toggleListItems}
				>
				<FormListToggle />
					{this.props.characters.map(c =>
						<Check
							key={c.uuid}
							name={c.slug}
							label={c.name}
							disabled={
								//can't select this character if they're in the draft
								!!draftCharacters[c.slug]
							}
						/>
					)}
				</FormList>
			</div>
		);
	}

	renderDraftForm () {
		const { formState } = this.props;
		const myCharacters = getFormValue(formState, 'myCharacters') || [];
		const opponentCharacters = getFormValue(formState, 'opponentCharacters') || [];
		const draftCharacters = getFormValue(formState, 'draftCharacters') || [];

		const charDifference = Math.abs(myCharacters.length - opponentCharacters.length);
		const minimumCharacters = Math.max(myCharacters.length, opponentCharacters.length);
		const maximumCharacters = Math.floor((draftCharacters.length - charDifference) / 2) + minimumCharacters;

		const charactersPerUserValues =
			this.props.characters.map((character, i) => i + 1)
			// .filter(item => item >= minimumCharacters && item <= maximumCharacters);
			.filter(number =>
				// enough eligible characters to make up the difference in character numbers
				draftCharacters.length - charDifference >= 0 &&

				// if users already have assigned characters, we have to play with at least the bigger of those lists
				number >= minimumCharacters &&

				// at the end of the draft, users need to have the same number of characters
				number <= maximumCharacters
			);

		const myCharactersList = getListValues(formState, 'myCharacters');
		const opponentCharactersList = getListValues(formState, 'opponentCharacters');

		return (
			<div>
				<h3>Draft Characters</h3>
				<FormList
					listName="draftCharacters"
					formState={this.props.formState}
					updateList={this.props.updateList}
					toggleListItems={this.props.toggleListItems}
				>
					<FormListToggle />
					{this.props.characters.map(c =>
						<Check
							key={c.uuid}
							name={c.slug}
							label={c.name}
							disabled={myCharactersList[c.slug] || opponentCharactersList[c.slug]}
						/>
					)}
				</FormList>
				<Select
					name="charactersPerUser"
					label="Characters per player"
					items={charactersPerUserValues}
					defaultValue={maximumCharacters}
				/>
				<Select
					name="maxStartingValue"
					label="Max starting value"
					items={config.oneToTwentyFive}
					defaultValue={this.props.characters.length}
				/>
			</div>
		);
	}

	renderReview () {
		return (
			<div>
				<SubmitButton label="Submit"/>
			</div>
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
						disabled={stepIndex > 2}
					/>
				</div>
			</div>
		);
	}

	render () {
		return (
			<div className="page">
				<h1>Create a Tournament</h1>
				<ReasonsList reasons={this.props.formState.reasons} />

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

	onSubmit (data) {
		this.props.createTournament(data, this.props.me.token, formName)
		// redirect to the tournament page if registration was successful
		.then(
			action => {
				if (action.data.slug) {
					this.context.router.push(`/${action.data.slug}`);
				}
			}
		);
	}
}


const mapStateToProps = (state) => ({
	characters: getCharactersFromState(state),
	me: getMe(state),
	formState: getFormState(state, formName)
});

export default connect(mapStateToProps, {...formActions, fetchCharacters, createTournament})(TournamentCreator);
