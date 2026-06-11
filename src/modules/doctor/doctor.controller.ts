import { catchAsync } from "../../common/helpers/catch-async.js"
import { NextFunction, Request,Response } from "express"
import { generalResponse } from "../../common/helpers/general-response.js"
import { DoctorService } from "./doctor.service.js"

import { AuthRequest } from "../../common/middlewares/auth.middleware.js"
import { IDoctorSchedule } from "./doctor.interface.js"
import logger from "../../common/logger.js"




export class DoctorController{

private doctorService=new DoctorService()

getDoctor=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
   
    const user_id:number=(req as AuthRequest).user.id
    const result=await this.doctorService.getDoctor(user_id)    
   
    generalResponse({res,data:[result],message:'successfully fetched doctor profile',statusCode:200})

})

getTodaysAppointment=catchAsync(async(req:Request,res:Response)=>{

    const user_id:number=(req as AuthRequest).user.id 
    const result =await this.doctorService.getTodaysAppointment(user_id)
  
    generalResponse({res,data:[result],message:'Successfully Fetched Todays Appointment',statusCode:200})
})


getDoctorDashboard=catchAsync(async(req:Request,res:Response)=>{

    const user_id:number=(req as AuthRequest).user.id
    const result=await this.doctorService.getDoctorDashboardData(user_id)

    generalResponse({res,data:[result],message:'Successfully Fetched DashboardData',statusCode:200})
})


getWeeklySchedule=catchAsync(async(req:Request,res:Response)=>{

    const user_id:number=(req as AuthRequest).user.id
    const result =await this.doctorService.getWeeklySchedule(user_id)
    
    generalResponse({res,data:[result],message:'Weekly Schedule Fetched Successfully',statusCode:200})

})

postWeeklySchedule=catchAsync(async(req:Request,res:Response)=>{

  
    const data:IDoctorSchedule[]=req.body.schedules
   
    const result= await Promise.all(data.map(d=>this.doctorService.setWeeklySchedule(d)))
    
    
    

    generalResponse({res,data:[],message:'Successfully Inserted Data',statusCode:201})


})


}