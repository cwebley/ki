import * as c from '../constants';

export default function clearFormReasonsHelper (dispatch, formName, reasons) {
	if (!Array.isArray(reasons)) {
		return;
	}
	return popReasons(dispatch, formName, reasons.length);
}

function popReasons (dispatch, formName, reasonsToPop) {
	setTimeout(() => {
		dispatch({
			type: c.POP_FORM_REASON,
			formName
		});
		reasonsToPop--;

		//  recursively call until we're ready to clear the last one
		if (reasonsToPop > 0) {
			popReasons(dispatch, formName, reasonsToPop);
		}
	}, c.ERROR_RESET_TIME);
}
