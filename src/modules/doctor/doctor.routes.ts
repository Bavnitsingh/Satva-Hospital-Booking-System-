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

    // use doctorAuth
    this.router.get('/getDoctor',doctorAuth,this.doctorController.getDoctor)
    this.router.get('/getAppointment',doctorAuth,this.doctorController.getTodaysAppointment)
    this.router.get('/getDashboardData',doctorAuth,this.doctorController.getDoctorDashboard)
    this.router.get('/getWeeklySchedule',doctorAuth,this.doctorController.getWeeklySchedule)

    this.router.post('/postWeeklySchedule',doctorAuth,this.doctorController.postWeeklySchedule)
}


}