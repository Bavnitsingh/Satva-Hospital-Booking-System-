import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { AuthController } from "./auth.controller.js";



export class AuthRoutes implements Routes{

    path: string='/auth';
    router: Router=Router();
    contoller=new AuthController();

    constructor(){
        this.initializationRoutes()
    }

    private initializationRoutes():void{
        // use this way for 
        // this.router.post('/register',middleware,this.contoller.register)
    

    }


}  






