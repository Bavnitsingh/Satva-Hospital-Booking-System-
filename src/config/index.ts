import dotenv from 'dotenv'
import { number } from 'zod'
dotenv.config()

export const env={
    // SERVER PORT 
    PORT:Number(process.env.PORT) || 3333,
   
    //SERVER ENVIRONMENT
    NODE_ENV:process.env.NODE_ENV || 'DEVELOPMENT',

    // logger setup 
    LOG_LEVEL:process.env.LOG_LEVEL || 'info',

    //DATABASE URL 
    // DATABASE_URL:process.env.DATABASE_URL 

    // DATABASE CONFIG 
    DB_HOST:process.env.DB_HOST || 'localhost',
    DB_PORT:Number(process.env.DB_PORT) || 3306,
    DB_USER:process.env.DB_USER || 'root',
    DB_NAME:process.env.DB_NAME || 'satva_db',
    DB_PASSWORD:process.env.DB_PASSWORD || 'root',

}