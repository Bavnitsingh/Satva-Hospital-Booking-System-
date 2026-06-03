import {Pool,QueryResult} from 'pg'
import { env } from '../config/index.js'
import logger from '../common/logger.js';

const pool=new Pool({
    connectionString:env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Accommodates self-signed certificates safely for dev
    }
})

export async function dbConnection():Promise<void>{
    try{

    const connection=await pool.connect()
    if(connection){
        logger.info('Database connected successfully')
    }
    connection.release()
    }

    catch(err){
        logger.error('error connecting database')
      throw err;
    }
  
}


export const query = (text: string, params?: any[]): Promise<QueryResult> => {
  return pool.query(text, params);
};

