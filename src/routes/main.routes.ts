import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes.js";
import { Routes } from "../common/interfaces/routes.interfaces.js";
import { AdminRoutes } from "../modules/admin/admin.routes.js";


export function buildApiRouter():Router{

const router=Router()

const routes:Routes[]=[
    // add all routes here
    
    new AuthRoutes(),
    new AdminRoutes()
]



routes.forEach((route)=>{
    router.use(route.path,route.router)
    
})


return router;
}





