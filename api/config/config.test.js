import { config } from './config/global.js';

export var config = {
    "env": 'test',
    "pg": {
		"database": "test",
		"username": "ki",
		"password": "123456789FOOBARBAZ",
		"server": "localhost"
	},
	"redis": {
		"host": "127.0.0.1",
		"port": 6380
	},
};

config.env = "test";
config.pg.database = "test";
