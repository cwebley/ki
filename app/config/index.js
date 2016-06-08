export const apiBase = 'http://localhost:3000';
export const loginPath = '/api/user/login';
export const registerPath = '/api/user/register';
export const charactersPath = '/api/characters'
export const tournamentsPath = '/api/tournaments'

export const goalValues = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200, 225, 250, 275, 300];

var oneToTwentyFive = [];
for (let i = 0; i <= 25; i++) {
	oneToTwentyFive.push(i);
}
export { oneToTwentyFive }
