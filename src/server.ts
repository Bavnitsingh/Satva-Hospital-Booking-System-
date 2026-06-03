import { createServer,Server } from "http";
import { buildApp } from "./app.js";
import { env } from "./config/index.js";
import { create } from "domain";


const PORT= env.PORT
const NODE_ENV=env.NODE_ENV
async function buildServer():Promise<void>{

    try{
    
        const app =buildApp()
        const server:Server=createServer(app)

        server.listen(PORT,()=>{
            console.log(`Server is running on http://localhost:${PORT}`)
            console.log(`Server is in ${NODE_ENV} ENVIRONMENT`)
        })
        
        

    }
    catch(error){
        console.log(`Failed to start Server`,error)

    }
}
buildServer()