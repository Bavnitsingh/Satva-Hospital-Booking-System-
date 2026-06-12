import { Request,Response } from "express";
import { catchAsync } from "../../common/helpers/catch-async.js";

export class AdminPageController{
     renderAuditLogsPage = catchAsync(async(req:Request,res:Response)=>{
        res.render('admin/show_audit_logs');
    });

    renderDoctorsPage = catchAsync(async(req:Request,res:Response)=>{
        res.render('admin/show_doctors');
    })
  renderPatientsPage = catchAsync(async(req:Request,res:Response)=>{
        res.render('admin/show_patients')
    })

    renderAddDoctorPage = catchAsync(async(req:Request,res:Response)=>{
        res.render('admin/add_doctors');
    })  

    renderSingleDoctorPage = catchAsync(async(req:Request,res:Response)=>{
        res.render('admin/view_single_doctor')
    })
}