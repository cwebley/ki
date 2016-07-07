import * as c from '../constants';

export default function clearTournamentReasonsHelper (dispatch, tournamentSlug, reasons) {
	if (!Array.isArray(reasons)) {
		return;
	}
	return popReasons(dispatch, tournamentSlug, reasons.length);
}

function popReasons (dispatch, tournamentSlug, reasonsToPop) {
	setTimeout(() => {
		dispatch({
			type: c.POP_TOURNAMENT_REASON,
			tournamentSlug
		});
		reasonsToPop--
		//  call again until we're ready to clear the last one
		if (reasonsToPop > 0) {
			popReasons(dispatch, tournamentSlug, reasonsToPop);
		}
	}, c.ERROR_RESET_TIME);
}
