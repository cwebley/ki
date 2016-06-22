import * as api from '../api';
import * as c from '../constants';
import { GENERIC_ERROR } from '../errors';

const draftCharacter = (tournamentSlug, characterSlug, token) => dispatch => {
		api.draftCharacter(tournamentSlug, characterSlug, token)
			.then(
				body => {
					return dispatch({
						type: c.DRAFT_CHARACTER_SUCCESS,
						characterSlug,
						data: body
					})
				},
				error => {
					return dispatch({
						type: c.DRAFT_CHARACTER_FAILURE,
						tournamentSlug,
						characterSlug,
						reasons: (error && error.reasons) || [GENERIC_ERROR]
					})
				}
			)
}

export default draftCharacter;
