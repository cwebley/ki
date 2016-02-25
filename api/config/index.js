const location = './config.' + (process.env.NODE_ENV || 'global');
const config = require(location);

export default config;
