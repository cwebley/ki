import { query } from './persistence/pg';
import redis from './persistence/redis';

const sql = 'INSERT INTO users (name, password) VALUES ($1, $2)';
const params = ['Cameron', 'asdfasdf'];

query(sql, params, (err, results) => {
    console.log("PG ERR: ", err);
    console.log("PG RESULTS: ", results);
});

redis.set('foo', 'bar', (err, results) => {
    console.log("REDIS ERR: ", err);
    console.log("REDIS RESULTS: ", results);
});
