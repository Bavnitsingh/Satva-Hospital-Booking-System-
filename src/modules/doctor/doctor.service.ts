import { th } from "zod/locales";
import { JwtPayload } from "../auth/utils/jwt.js";
import { IDoctorLeave, IDoctorNotification, IDoctorSchedule, IMedicalAttachments, IMedicalRecords, IPrescriptionItems, IPrescriptions } from "./doctor.interface.js";
import { DoctorRepo } from "./doctor.repository.js";
import { HttpException, NotFoundException, UnauthorizedException } from "../../common/helpers/http-exception.js";
import { getNextWeekStartingDay } from "./utils/doctor.utilts.js";
import { start } from "node:repl";


export class DoctorService{

    private doctorRepo=new DoctorRepo()


    async getDoctor(user_id:number){
    
        const doctorDetails=await this.doctorRepo.findDoctorByUserID(user_id)
        const docQualifictionDetail= await this.doctorRepo.findDoctorQualificationByDoctorID(doctorDetails.doctor_id)
        return {doctorDetails,docQualifictionDetail}
        
    }
    
    async getDoctorId(user_id:number){
        if(!user_id){
            throw new NotFoundException("user not found")
        }
        const doctorDetails=await this.doctorRepo.findDoctorByUserID(user_id)
        return doctorDetails.doctor_id
    }

    async getTodaysAppointment(user_id:number){

        const doctor_id =await this.getDoctorId(user_id)
        const date= new Date().toISOString()
        const current_date=String(date.split('T')[0])
        const appointment_list=await this.doctorRepo.findDoctorAppointments(doctor_id,current_date)
        return {appointment_list}        

    }

    async getDoctorDashboardData(user_id:number){

        const doctor_id = await this.getDoctorId(user_id)
        const dashboard_data=await this.doctorRepo.DoctorDashBoardData(doctor_id)

        return {dashboard_data}
        
    }

    async getWeeklySchedule(user_id:number){
        const doctor_id =await this.getDoctorId(user_id)
        const start_date=getNextWeekStartingDay();

        const weekScheduleList=await this.doctorRepo.findDoctorScheduleByDoctorID(doctor_id,start_date)
        console.log(weekScheduleList)
        return {weekScheduleList}
        

    }

    async setWeeklySchedule(data:IDoctorSchedule){

        if(!data){
            throw new NotFoundException('Data is empty')
        }

    const result=await this.doctorRepo.insertDoctorSchedule(data)       
    return {result}      

    }

    async setLeaves(data:IDoctorLeave){
        
        const result = await this.doctorRepo.insertDoctorLeaves(data)

        return {result}
    }

    async getDoctorNotification(doctor_id:number){


        const notifications =await this.doctorRepo.findDoctorNotification(doctor_id)
        return {notifications}

    }

    async insertDoctorNotification(data:IDoctorNotification){
        const result =await this.doctorRepo.insertDoctorNotification(data)
        return {result}
    }

    async insertMedicalRecords(medical_records:IMedicalRecords){
        const result =await this.doctorRepo.insertMedicalRecords(medical_records)
        return {result}
    }

    async insertMedicalRecordsAttachments(medical_record_attachment:IMedicalAttachments){
        const result=await this.doctorRepo.insertMedicalRecordsAttactments(medical_record_attachment)

        return {result}
    }


    async insertPrescriptions(data:IPrescriptions){
        const result=await this.doctorRepo.insertPrescription(data)
        return {result}
    }

    async insertPrescriptionItems(data:IPrescriptionItems){
        const result =await this.doctorRepo.insertPrescriptionItems(data)
        return {result}

    }

    


}