//	config = require('../../../node-packages/config');

// import { existsSync, readFileSync } from 'fs';
// import { join } from 'path';

// var l = path.join(__dirname, 'local.json');

const defaultConfigs = {
	"pg": {
		"database": "ki",
		"username": "ki",
		"password": "123456789FOOBARBAZ",
		"server": "localhost"
	},
	"redis": {
		"host": "127.0.0.1",
		"port": 6379
	},
};

// if(!fs.existsSync(l)) {
// 	return module.exports = _.defaultsDeep(config, defaultConfigs);
// }

// var localConfigs = JSON.parse(fs.readFileSync(l));
// module.exports = _.defaultsDeep(localConfigs, config, defaultConfigs);

export defaultConfigs;
