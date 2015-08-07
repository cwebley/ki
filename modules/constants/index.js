var ConstantsInterface = {};

ConstantsInterface.characters = ['jago','wulf','thunder','sadira','orchid','glacius','spinal','fulgore','tj','maya','kanra','riptor','omen','aganos','hisako','cinder','aria','rash']

ConstantsInterface._STARTING_PWR_STOCK = 4;
ConstantsInterface._INSPECT_COUNT = 9;

/* ex: length = 15 and value = 3.1
**	get 15 upcoming characters. each one has a 3.1/15
** chance of being converted to the character you provided
*/
ConstantsInterface._ODDS_MAKER_LENGTH = 15;
ConstantsInterface._ODDS_MAKER_VALUE = 3.1;

// give winning player's streak through this function. if returns true, streakPoints should be updated.
// default to 3,5,6... etc
ConstantsInterface.shouldIncreaseStreakPoints = function(streak){
	if(streak === 3 || streak > 4){
		return true;
	}
	return false;
};

module.exports = ConstantsInterface;
