import uuid from 'node-uuid';

const generateUpcomingCharacter = (availableCharacterUuids) => {
	if (!Array.isArray(availableCharacterUuids)) {
		availableCharacterUuids = [availableCharacterUuids];
	}

	return JSON.stringify({
		uuid: uuid.v4(),
		characterUuid: availableCharacterUuids[Math.floor(Math.random() * availableCharacterUuids.length)]
	});
};

export default generateUpcomingCharacter;
