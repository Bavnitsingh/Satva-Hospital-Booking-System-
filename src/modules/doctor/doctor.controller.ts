import { catchAsync } from "../../common/helpers/catch-async.js"
import { Request,Response } from "express"
import { generalResponse } from "../../common/helpers/general-response.js"
import { DoctorService } from "./doctor.service.js"
import { JwtPayload } from "../auth/utils/jwt.js"
import { AuthRequest } from "../../common/middlewares/auth.middleware.js"


export class DoctorController{

private doctorService=new DoctorService()

getDoctor=catchAsync(async(req:Request,res:Response)=>{
    const user_id:number=(req as AuthRequest).user.id
    const result=await this.doctorService.getDoctor(user_id)
  
    generalResponse({res,data:[result],message:'successfully fetched doctor profile',statusCode:200})

})
    


}