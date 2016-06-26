import * as api from '../api';
import * as c from '../constants';
import { GENERIC_ERROR } from '../errors';

const draftCharacter = (tournamentSlug, character, userUuid, token) => dispatch => {
		api.draftCharacter(tournamentSlug, character.slug, token)
			.then(
				body => {
					return dispatch({
						type: c.DRAFT_CHARACTER_SUCCESS,
						tournamentSlug,
						character,
						userUuid,
						data: body
					})
				},
				error => {
					return dispatch({
						type: c.DRAFT_CHARACTER_FAILURE,
						tournamentSlug,
						character,
						userUuid,
						reasons: (error && error.reasons) || [GENERIC_ERROR]
					})
				}
			)
}

export default draftCharacter;
