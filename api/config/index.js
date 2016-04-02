const location = './config.' + (process.env.NODE_ENV || 'global');
const config = require(location).default;

export default config;
