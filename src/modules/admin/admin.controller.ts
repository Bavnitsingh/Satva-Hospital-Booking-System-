import { Request, Response } from "express";
import { catchAsync } from "../../common/helpers/catch-async.js";
import { generalResponse } from "../../common/helpers/general-response.js";
import { AdminService } from "./admin.service.js";
import { AuthRequest } from "../../common/middlewares/auth.middleware.js";

export class AdminController{
    private adminService = new AdminService();
 
    fetchDoctors = catchAsync(async (req:Request,res:Response)=>{
        const hospital_id = req.query.hospital_id;
           
        if(hospital_id===undefined){
            throw new Error("Hospital Id required!")
        }
        const doctors = await this.adminService.fetchDoctors(Number(hospital_id));
        generalResponse({
            res,
            data:doctors,
            message:"Doctors Fetched Successfully",
            statusCode:201
        })
        
    })

    showDoctorsPage = catchAsync(async(req:Request,res:Response)=>{
        res.render('admin/show_doctors');
    })

    showAddDoctorPage = catchAsync(async(req:Request,res:Response)=>{
        res.render('admin/add_doctors');
    })

    showPatientsPage = catchAsync(async(req:Request,res:Response)=>{
        res.render('admin/show_patients')
    })

    addDoctor = catchAsync(async(req:Request,res:Response)=>{
      
        // Add validation for doctor data
        
        const {firstName,email,password,lastName,gender,bio,consultationFee,experienceYears} = req.body;
        const user_id = (req as AuthRequest).user.id;
        const hospitalId = await this.adminService.getHospitalId(user_id);
        const registerDoctorData = {firstName,lastName,email,password,gender,bio,consultationFee,experienceYears,hospitalId}
         const result = await this.adminService.addDoctor(registerDoctorData);
          generalResponse({
            res,
            data:result,
            message:"Doctor Registered Successfully",
            statusCode:201
        })

    })
}