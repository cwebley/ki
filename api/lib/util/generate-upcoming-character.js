import uuid from 'node-uuid';

const generateUpcomingCharacter = (availableCharacterUuids, opts) => {
	if (!Array.isArray(availableCharacterUuids)) {
		availableCharacterUuids = [availableCharacterUuids];
	}
	if (!opts) {
		opts = {};
	}

	let characterObject = {
		uuid: uuid.v4(),
		characterUuid: availableCharacterUuids[Math.floor(Math.random() * availableCharacterUuids.length)]
	};
	if (opts.oddsmaker) {
		characterObject.oddsmaker = true;
	}

	return JSON.stringify(characterObject);
};

export default generateUpcomingCharacter;
