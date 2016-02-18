import { query } from './persistence/pg';

let name = 'Cameron';

const sql = 'INSERT INTO users (name) VALUES ($1)';
const params = [name];

query(sql, params, (err, results) => {
    console.log("PG ERR: ", err);
    console.log("PG RESULTS: ", results);
});
