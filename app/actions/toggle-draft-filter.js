import * as c from '../constants';

const toggleDraftFilter = (tournamentSlug, leftUuid, rightUuid) => ({
	type: c.TOGGLE_DRAFT_FILTER,
	tournamentSlug,
	leftUuid,
	rightUuid
});

export default toggleDraftFilter;
