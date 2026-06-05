import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes.js";
import { Routes } from "../common/interfaces/routes.interfaces.js";


export function buildApiRouter():Router{

const router=Router()

const routes:Routes[]=[
    // add all routes here
    new AuthRoutes()
]



routes.forEach((route)=>{
    router.use(route.path,route.router)
    
})


return router;
}





