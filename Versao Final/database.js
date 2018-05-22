const r = require('rethinkdb');  
const config = require('./config.json');  
let conn;

r.connect(config.rethinkdb)  
    .then(connection => {
        console.log('Connecting RethinkDB...');
        conn = connection;
        return r.dbCreate('hmi').run(conn);
    })
    .then(() => {
        console.log('Database "hmi" created!');
        return r.db('hmi').tableCreate('file_execution').run(conn);
    })
    .then(() => console.log('Table "file_execution" created!'))
    .error(err => console.log(err))
    .finally(() => process.exit(0));