import { combineReducers } from 'redux';
import forms, * as fromForms from './forms/index';
import tournaments, * as fromTournaments from './tournaments';
import me from './me';
import characters from './characters';

export default combineReducers({
	me,
	forms,
	characters,
	tournaments
});

export const getCharactersFromState = (state) => state.characters || [];

export const getMe = (state) => state.me || {};

export const getFormState = (state, formName) => fromForms.getFormState(state.forms, formName);

export const getTournamentFromState = (state, tournamentSlug) => fromTournaments.getTournamentFromState(state.tournaments, tournamentSlug);

export const getTournamentIndexFromState = (state) => fromTournaments.getTournamentIndexFromState(state.tournaments);
