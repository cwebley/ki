import React, { PropTypes } from 'react'; // necessary for this stateless component?
import { List, ListItem } from 'material-ui/List';
import AlertError from 'material-ui/svg-icons/alert/error';
import AlertErrorOutline from 'material-ui/svg-icons/alert/error-outline';
import { red500, blue500 } from 'material-ui/styles/colors';

const ReasonsList = ({ reasons }) => {
	if (!reasons) {
		return false;
	}
	return (
		<div>
			<List>
				{reasons.map((r) =>
					<ListItem
						key={r.id}
						primaryText={r.message}
						leftIcon={r.level === 'error' ? <AlertError color={red500} /> : <AlertErrorOutline color={blue500} />}
						disabled
					/>
				)}
			</List>
		</div>
	);
};

ReasonsList.displayName = 'reasonsList';
ReasonsList.propTypes = {
	reasons: PropTypes.arrayOf(
		PropTypes.object
	)
};

export default ReasonsList;
