var config = {
	env: 'development',
	pg: {
		database: 'ki',
		username: 'ki',
		password: '123456789FOOBARBAZ',
		server: 'localhost'
	},
	redis: {
		host: '127.0.0.1',
		port: 6379
	},
	jwt: {
		secret: 'asdfasdf',
		expiresIn: '1 year'
	},
	defaults: {
		startCoins: 10,
		goal: 100,
		upcomingListLength: 50,
		oddsmakerLength: 15,
		oddsmakerValue: 3.1
	},
	cost: {
		rematch: 3,
		oddsmaker: 3,
		inspect: 3
	}
};

export default config;
