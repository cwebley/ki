const env = process.env.NODE_ENV || 'development';
import { config } from './config' + env;

export { config };
