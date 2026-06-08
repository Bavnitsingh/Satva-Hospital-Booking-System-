import { Request,Response } from "express";
import { catchAsync } from "../../common/helpers/catch-async.js";
import { generalResponse } from "../../common/helpers/general-response.js";
import { PatientService } from "./patient.service.js";



export class PatientController {



private patientService = new PatientService()

profilePage=(req:Request,res:Response)=>{
    res.render('profile/edit-profile')
}


showProfile=catchAsync(async(req:Request,res:Response)=>{

const result= await this.patientService.showProfile(Number(req.params.user_id))

generalResponse({res,data:result,message:'Profile Fetched Successfully',statusCode:200})
})

updateProfile=catchAsync(async(req:Request,res:Response)=>{

    const result=await this.patientService.updateProfile(req.body,Number(req.params.user_id))

    generalResponse({res,data:[],message:'Profile Update Successfully',statusCode:200})
})



updateProfilePicture=catchAsync(async(req:Request,res:Response)=>{

    const destination=req.file?.destination || 'uploads/patient_profile/default.png'

    const result =await this.patientService.updatePatientProfile(Number(req.params.user_id),destination)

    generalResponse({res,data:[],message:'Profile Image successfully',statusCode:201})

})

}