import { Request, Response } from "express";
import { catchAsync } from "../../common/helpers/catch-async.js";
import { generalResponse } from "../../common/helpers/general-response.js";
import { AuthService } from "./auth.service.js";

export class AuthController {
  private authService = new AuthService();

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



  login = catchAsync(async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);
    generalResponse({
      res,
      data: result,
      message: "Logged in Successfully",
      statusCode: 200,
    });
  });




  registerDoctor = catchAsync(async (req: Request, res: Response) => {
  
    const result = await this.authService.registerDoctor(req.body);


    generalResponse({
      res,
      data: result,
      message: "Doctor Registration Successful",
      statusCode: 201,
    });
  });

  registerAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await this.authService.registerAdmin(req.body);

    generalResponse({
      res,
      data: result,
      message: "Admin Registration Successful",
      statusCode: 201,
    });
  });
  
  register = catchAsync(async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);
    generalResponse({
      res,
      data: result,
      message: "Registration Successfull",
      statusCode: 201,
    });
  });
}
