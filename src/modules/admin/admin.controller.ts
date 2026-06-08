import { Request, Response } from "express";
import { catchAsync } from "../../common/helpers/catch-async.js";
import { generalResponse } from "../../common/helpers/general-response.js";
import { AdminService } from "./admin.service.js";

export class AdminController{
    private adminService = new AdminService();
 
    fetchDoctors = catchAsync(async (req:Request,res:Response)=>{
        const hospital_id = req.query.hospital_id;
            const page  = parseInt(req.query.page as string)  || 1;
            const limit = parseInt(req.query.limit as string) || 10;
        if(hospital_id===undefined){
            throw new Error("Hospital Id required!")
        }
        const doctors = await this.adminService.fetchDoctors(Number(hospital_id),page,limit);
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

    addDoctor = catchAsync(async(req:Request,res:Response)=>{
        
    })
}