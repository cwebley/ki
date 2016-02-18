import { query } from './persistence/pg';

const sql = 'INSERT INTO users (name, password) VALUES ($1, $2)';
const params = ['Cameron', 'asdfasdf'];

query(sql, params, (err, results) => {
    console.log("PG ERR: ", err);
    console.log("PG RESULTS: ", results);
});
