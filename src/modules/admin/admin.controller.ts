import { Request, Response } from "express";
import { catchAsync } from "../../common/helpers/catch-async.js";
import { generalResponse } from "../../common/helpers/general-response.js";
import { AdminService } from "./admin.service.js";
import { AuthRequest } from "../../common/middlewares/auth.middleware.js";

export class AdminController{
    private adminService = new AdminService();
 
    fetchDoctors = catchAsync(async (req:Request,res:Response)=>{
         const user_id = (req as AuthRequest).user.id;
        const hospital_id = await this.adminService.getHospitalId(user_id);
           
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


    fetchPatients = catchAsync(async (req: Request, res: Response) => {
        const user_id = (req as AuthRequest).user.id;
        const hospitalId = await this.adminService.getHospitalId(user_id);
        const patients = await this.adminService.fetchPatients(hospitalId);
    generalResponse({ res, data: patients, message: "Patients fetched successfully", statusCode: 200 });
  });

    

    

   

   addDoctor = catchAsync(async (req: Request, res: Response) => {
    const {
      firstName, lastName, email, password,
      gender, bio, consultationFee, experienceYears,
      specialties,
      qualifications,
    } = req.body;

    const user_id    = (req as AuthRequest).user.id;
    const hospitalId = await this.adminService.getHospitalId(user_id);

    const result = await this.adminService.addDoctor({
      firstName, lastName, email, password,
      gender, bio, consultationFee, experienceYears,
      hospitalId,
      specialties:    specialties    ,
      qualifications: qualifications ,
    });

    generalResponse({
      res,
      data:       result,
      message:    'Doctor Registered Successfully',
      statusCode: 201,
    });
  });

    viewDoctor = catchAsync (async(req:Request,res:Response)=>{
        const doctor_id =  Number(req.params.doctorId);
        const doctor = await this.adminService.fetchDoctorFromId(doctor_id);
        generalResponse({
            res,
            data:doctor,
            message:"Doctor Fetched from ID",
            statusCode:201
        })
    })

  // admin.controller.ts

editDoctor = catchAsync(async (req: Request, res: Response) => {
  const doctor_id = Number(req.params.doctorId);
  const data      = req.body;

  const doctor = await this.adminService.editDoctor(doctor_id, data);

  generalResponse({
    res,
    data:       doctor,
    message:    'Doctor details edited successfully',
    statusCode: 200,
  });
});
    // Just call addAuditLog method and give payload in parameters
    
   fetchAppointments = catchAsync(async(req:Request,res:Response)=>{
 const user_id = (req as AuthRequest).user.id;
        const hospital_id = await this.adminService.getHospitalId(user_id);
    const appointments = await this.adminService.fetchAppointmentsByHospitalId(hospital_id);

    generalResponse({
        res,
        data:appointments,
        message:"Appointments fetched properly",
        statusCode:201
    })
    })

    fetchAuditLogs = catchAsync(async(req:Request,res:Response)=>{
        const user_id = (req as AuthRequest).user.id;
        const hospital_id = await this.adminService.getHospitalId(user_id);
        const logs = await this.adminService.fetchAuditLogs(hospital_id);
        generalResponse({
            res,
            data:logs,
            message:"Logs fetched successfully",
            statusCode:201

        })
    })

    fetchSpecialties=catchAsync(async(req:Request,res:Response)=>{
        const specs = await this.adminService.fetchSpecialties();
        generalResponse({
            res,
            data:specs,
            message:"Specialities fetched successfully",
            statusCode:201
        })
    })

    toggleDoctorStatus = catchAsync(async (req: Request, res: Response) => {
        const doctorId = Number(req.params.id);
        const { is_deactivated } = req.body;

        if (is_deactivated === undefined) {
            throw new Error("is_deactivated property value is required!");
        }

        const result = await this.adminService.toggleDoctorStatus(doctorId, Number(is_deactivated));
        
        generalResponse({
            res,
            data: result,
            message: `Doctor status altered successfully`,
            statusCode: 200
        });
    });

}