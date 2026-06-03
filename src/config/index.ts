import dotenv from 'dotenv'
dotenv.config()

export const env={
    // SERVER PORT 
    PORT:Number(process.env.PORT) || 3333,
   
    //SERVER ENVIRONMENT
    NODE_ENV:process.env.NODE_ENV || 'DEVELOPMENT'

}