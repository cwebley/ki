import * as c from '../constants';

const updateInspectState = (tournamentSlug, userUuid, data) => ({
	type: c.UPDATE_INSPECT_STATE,
	tournamentSlug,
	userUuid,
	data
});

export default updateInspectState;
