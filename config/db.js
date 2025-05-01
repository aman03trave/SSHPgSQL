import pkg from 'pg';
const {Pool} = pkg;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'SSHBackend',
    password: 'appleom2003',
    port: 5432,

});

export default pool;