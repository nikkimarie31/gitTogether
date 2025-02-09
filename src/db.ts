import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // this is the connection string to the database   
});

pool.on('connect', () => {
    console.log('connected to the db');
});

export default pool;