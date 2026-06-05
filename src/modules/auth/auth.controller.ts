

/*




*/


import { Request,Response } from "express";
import { catchAsync } from "../../common/helpers/catch-async.js";
import { generalResponse } from "../../common/helpers/general-response.js";
import { AuthService } from "./auth.service.js";
import { request } from "http";


export class AuthController{
    private authService= new AuthService()


    // this is default way to use module
    // register=catchAsync(async(req:Request,res:Response)=>{
    //     try{
    //     const result=await this.authService.register(req.body);
    //     generalResponse({res,data:result,message:'Registration Successful'})
    //     }
    //     catch(err){
    //         generalResponse({res,data:null,message:'Error in Registration',statusCode:500})
    //     }
    
    // })

    getDoctorLoginPage=catchAsync(async(req:Request,res:Response)=>{
        try {
            res.render("auth/doctor/doctorLogin")
        } catch (error) {
            generalResponse({res,data:null,message:'Error in Registration',statusCode:500})
        }
    })

   

}