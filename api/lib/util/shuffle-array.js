export default function shuffleArray (items) {
	let currentIndex = items.length;
	let temporaryValue;
	let randomIndex;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = items[currentIndex];
		items[currentIndex] = items[randomIndex];
		items[randomIndex] = temporaryValue;
	}

	return items;
}
