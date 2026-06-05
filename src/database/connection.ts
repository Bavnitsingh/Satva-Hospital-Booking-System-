import mysql, {Connection,QueryResult} from 'mysql2/promise'
import { env } from '../config/index.js'
import logger from '../common/logger.js';


const connection=await mysql.createConnection({
    host:env.DB_HOST,
    port:env.DB_PORT,
    user:env.DB_USER,
    password:env.DB_PASSWORD,
    database:env.DB_NAME
})

export async function dbConnection():Promise<void>{
    try{

    await connection.connect()
    if(connection){
        logger.info('Database connected successfully')
    }
    connection.end()
    }

    catch(err){
        logger.error('error connecting database')
      connection.end()
    }
  
}


// use query function to run postgreSQL query
// export const query = (text: string, params?: any[])=> {
//   return connection.query(text, params);
// };

export default connection;