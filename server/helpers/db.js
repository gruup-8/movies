import pkg from 'pg'
import dotenv from 'dotenv'

const environment = process.env.NODE_ENV
dotenv.config()

//const port = process.env.PORT || 3001;

const { Pool } = pkg;

const Db = () => {
    return new Pool ({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.NODE_ENV === 'development' ? process.env.DB_NAME : process.env.TEST_DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    });
};

const pool = Db()

export { pool, Db }
export default pool;
