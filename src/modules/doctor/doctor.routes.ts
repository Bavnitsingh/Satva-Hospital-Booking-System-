import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { DoctorController } from "./doctor.controller.js";
import { doctorAuth } from "../../common/middlewares/auth.middleware.js";




export class DoctorRoutes implements Routes{  

path:string='/doctor'
router:Router=Router()
doctorController=new DoctorController()

constructor(){
    this.init()
}

private init():void{


    this.router.get('/getDoctor',doctorAuth,this.doctorController.getDoctor)
}


}