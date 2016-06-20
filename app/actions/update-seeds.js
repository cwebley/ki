import * as c from '../constants';

const updateSeeds = (tournamentSlug, data) => ({
	type: c.UPDATE_SEEDS,
	tournamentSlug,
	data
});

export default updateSeeds;
