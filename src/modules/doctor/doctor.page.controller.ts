import { Request,Response } from "express"
import { AuthRequest } from "../../common/middlewares/auth.middleware.js"


export class DoctorPageController{

    renderDashboard=(req:Request,res:Response)=>{
        res.render("doctor/dashboard",{user:(req as any).user})
    }

    renderProfile=(req:Request,res:Response)=>{
        res.render("doctor/doctor-profile",{user:(req as any).user})
    }

    renderEditProfile=(req:Request,res:Response)=>{
        res.render("doctor/edit-profile",{user:(req as any).user})
    }

    renderDoctorLogin=(req:Request,res:Response)=>{
        res.render("doctor/doctorLogin")
    }

    renderCreateMedicalRecords=(req:Request,res:Response)=>{

        res.render("doctor/create_medical_records")
    }

    
}