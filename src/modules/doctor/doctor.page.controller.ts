import { Request,Response } from "express"
import { AuthRequest } from "../../common/middlewares/auth.middleware.js"


export class DoctorPageController{

    renderDashboard=(req:Request,res:Response)=>{
        res.render("doctor/dashboard",{user:(req as any).user})
    }


    
}