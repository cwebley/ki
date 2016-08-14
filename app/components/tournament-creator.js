import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import get from 'lodash.get';
import * as config from '../config';

import ReasonsList from './reasons-list';

import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';

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
	{ name: 'sibyl.org', goal: 231, opponentName: 'Orlo Johnston', startCoins: 10 }

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
					placeholder="Like a Rock: A story of ruin"
				/>
				<Select
					name="goal"
					label="Goal"
					items={config.goalValues}
					defaultValue={100}
				/>
				<Text
					name="opponentName"
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
		const opponentName = getFormValue(formState, 'opponentName') || 'Opponent';

		return (
			<div style={{
				overflow: 'auto'
			}}>
				<div style={{
					width: '50%',
					float: 'left'
				}}>
					<h2>{this.props.me.name}</h2>
					<FormList
						listName="myCharacters"
						formState={formState}
						updateList={this.props.updateList}
						toggleListItems={this.props.toggleListItems}
					>
						<div style={{
							padding: '1rem',
							width: '50%',
							float: 'right'
						}}>
							<FormListToggle />
						</div>
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
				<div style={{
					width: '50%',
					float: 'right'
				}}>
					<h2>{opponentName}</h2>
					<FormList
						listName="opponentCharacters"
						formState={formState}
						updateList={this.props.updateList}
						toggleListItems={this.props.toggleListItems}
					>
					<div style={{
						padding: '1rem',
						width: '50%',
						float: 'right'
					}}>
						<FormListToggle />
					</div>
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
					<div style={{
						padding: '1rem',
						width: '25%',
						float: 'right'
					}}>
						<FormListToggle />
					</div>
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
					defaultValue={this.props.characters.length / 2}
				/>
			</div>
		);
	}

	renderReview () {
		const tournamentName = getFormValue(this.props.formState, 'name') || 'Unnamed Tournament';
		const goal = getFormValue(this.props.formState, 'goal') || 'Not yet specified';
		const startCoins = getFormValue(this.props.formState, 'startCoins') || 'Not yet specified';
		const opponentName = getFormValue(this.props.formState, 'opponentName') || 'Unnamed Opponent';
		const myCharacters = getFormValue(this.props.formState, 'myCharacters') || [];
		const opponentCharacters = getFormValue(this.props.formState, 'opponentCharacters') || [];
		const draftCharacters = getFormValue(this.props.formState, 'draftCharacters') || [];
		const charactersPerUser = getFormValue(this.props.formState, 'charactersPerUser') || 'Not yet specified';
		const maxStartingValue = getFormValue(this.props.formState, 'maxStartingValue') || 'Not yet specified';

		return (
			<div style={{
				overflow: 'auto'
			}}>
				<div style={{
					paddingBottom: '1rem'
				}}>
					<h2 style={{
						textAlign: 'center',
						paddingBottom: '1rem'
					}}>{tournamentName}</h2>
					<ul>
						<li>{`Goal: ${goal}`}</li>
						<li>{`Starting coin stock: ${startCoins}`}</li>
					</ul>
				</div>
				<div>
				<h3 style={{
					textAlign: 'center',
					paddingBottom: '1rem'
				}}>Players</h3>
					<div style={{
						width: '50%',
						float: 'left'
					}}>
						<h3 style={{textAlign: 'center'}}>{this.props.me.name}</h3>
						{myCharacters.length ? <ul>{myCharacters.map(cSlug =>
							<li key={cSlug}>{cSlug}</li>
						)}</ul> : false}
					</div>
					<div style={{
						width: '50%',
						float: 'right'
					}}>
						<h3 style={{textAlign: 'center'}}>{opponentName}</h3>
						{opponentCharacters.length ? <ul>{opponentCharacters.map(cSlug =>
							<li key={cSlug}>{cSlug}</li>
						)}</ul> : false}
					</div>
				</div>
				<div>
					<h2 style={{
						textAlign: 'center',
						paddingBottom: '1rem'
					}}>Draft</h2>
					{draftCharacters.length ? <div>
						<h3>Eligible Characters</h3>
						<ul>{draftCharacters.map(cSlug =>
							<li key={cSlug}>{cSlug}</li>
						)}</ul>
						<h3>Draft Settings</h3>
						<ul>
							<li>{`Characters Per Player: ${charactersPerUser}`}</li>
							<li>{`Max starting value: ${maxStartingValue}`}</li>
						</ul>
					</div> : <span>This tournament will have no draft</span>}
				</div>

				<div style={{
					paddingTop: '1rem',
					float: 'right'
				}}>
					<SubmitButton label="Submit"/>
				</div>
			</div>
		);
	}

	renderStepContent () {
		const { stepIndex } = this.state;
		return (
			<div>
				{this.renderForm(stepIndex)}
				<div>
					<div style={{
						paddingTop: '1rem',
						margin: '0 auto'
					}}>
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
			</div>
		);
	}

	render () {
		return (
			<div className="page">
				<h1>Create a Tournament</h1>
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
					{this.props.formState.reasons && this.props.formState.reasons.length > 0 && <Snackbar
						open={!!this.props.formState.reasons.length}
						message={this.props.formState.reasons[0].message}
						autoHideDuration={10000}
					/>}
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
