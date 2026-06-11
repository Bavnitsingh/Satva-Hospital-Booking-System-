import { catchAsync } from "../../common/helpers/catch-async.js"
import { NextFunction, Request,Response } from "express"
import { generalResponse } from "../../common/helpers/general-response.js"
import { DoctorService } from "./doctor.service.js"

import { AuthRequest } from "../../common/middlewares/auth.middleware.js"
import { IDoctorSchedule } from "./doctor.interface.js"
import logger from "../../common/logger.js"
import { BadRequestException, InternalServerException, NotFoundException } from "../../common/helpers/http-exception.js"
import { resolveObjectURL } from "node:buffer"




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
    if(!result){
        throw new InternalServerException('Error while inserting schedule')
    }

    generalResponse({res,data:[],message:'Successfully Inserted Data',statusCode:201})


})

getPatientList=catchAsync(async(req:Request,res:Response)=>{
    const user_id=(req as AuthRequest).user.id 
    const result =await this.doctorService.getPatientList(user_id)

    generalResponse({res,data:[result],message:'Successfully Fetched Data',statusCode:200})

})

postPatientMedicalRecords=catchAsync(async(req:Request,res:Response)=>{
    const {patient_id,doctor_id,appointment_id,diagnosis,examination_notes,}=req.body

    //pending will work when frontend integrated 

    generalResponse({res,data:[],message:'Successfully Inserted Medical Data',statusCode:201})

})

getPatientAllMedicalRecords=catchAsync(async(req:Request,res:Response)=>{
    const user_id=(req as AuthRequest).user.id
    const patient_id=Number(req.params.patient_id)
    if(!patient_id || patient_id==undefined){
        throw new BadRequestException('patient id is required')
    } 
    console.log(user_id)

    const result =await this.doctorService.getPatientAllMedicalRecords(user_id,patient_id)

    generalResponse({res,data:[result],message:'Successfully Fetched Medical Records',statusCode:200})
})

getPatientMedicalData=catchAsync(async(req:Request,res:Response)=>{

    const record_id =Number(req.params.record_id)
    if(!record_id || record_id==undefined){
        throw new BadRequestException('record_id is required')
    }

    const medical_attachments= await this.doctorService.getPatientAllMedicalAttachments(record_id)
    const prescription_data=await this.doctorService.getPatientMedicalRecordAllPrescription(record_id)

    generalResponse({res,data:[medical_attachments,prescription_data],message:'Successfully Fetched Medical Record Data',statusCode:200})


})




}