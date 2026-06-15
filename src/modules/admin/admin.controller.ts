import { Request, Response } from "express";
import { catchAsync } from "../../common/helpers/catch-async.js";
import { generalResponse } from "../../common/helpers/general-response.js";
import { AdminService } from "./admin.service.js";
import { AuthRequest } from "../../common/middlewares/auth.middleware.js";
import { Hospital } from "./interfaces/hospital.interface.js";
import { calculatePercentageChange } from "./utils/stats.utils.js";

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
            statusCode:200
        })
        
    })


    fetchPatients = catchAsync(async (req: Request, res: Response) => {
        const user_id = (req as AuthRequest).user.id;
        const hospitalId = await this.adminService.getHospitalId(user_id);
        const patients = await this.adminService.fetchPatients(hospitalId);
    generalResponse({ res,
         data: patients, 
         message: "Patients fetched successfully",
          statusCode: 200 });
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
            statusCode:200
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
        statusCode:200
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
            statusCode:200

        })
    })

    fetchSpecialties=catchAsync(async(req:Request,res:Response)=>{
        const specs = await this.adminService.fetchSpecialties();
        generalResponse({
            res,
            data:specs,
            message:"Specialities fetched successfully",
            statusCode:200
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
            statusCode: 201
        });
    });

    fetchPatientDetails = catchAsync(async(req:Request,res:Response)=>{
        const patient_id = Number(req.params.patientId);
        const patient = await this.adminService.fetchPatientDetails(patient_id);
        generalResponse({
            res,
            data:patient,
            message:`Patient Fetched successfully`,
            statusCode:200
        })
    })

fetchHospitalDetails = catchAsync(async(req:Request,res:Response)=>{
 const user_id = (req as AuthRequest).user.id;
 const hospital_id = await this.adminService.getHospitalId(user_id);
 const hospital = await this.adminService.fetchHospitalDetails(hospital_id);
 generalResponse({
    res,
    data:hospital,
    message:`Hospital fetched successfully`,
    statusCode:200
 })
})

updateHospitalSettings = catchAsync(async(req:Request,res:Response)=>{
    const user_id = (req as AuthRequest).user.id;
 const hospital_id = await this.adminService.getHospitalId(user_id);
 const {hospital_name,email,address_line1,address_line2,contact_number} = req.body;
 const payload:Hospital = {hospital_name,email,address_line1,address_line2,contact_number};
 const hospital = await this.adminService.updateSettings(hospital_id,payload);
 generalResponse({
    res,
    data:hospital,
    message:`Hospital Settings updated successfully`,
    statusCode:201
 })
})


fetchStatsOfHospital = catchAsync(async (req: Request, res: Response) =>  {
  const user_id = (req as AuthRequest).user.id;
  const hospital_id = await this.adminService.getHospitalId(user_id);
  const statsArray:any = await this.adminService.fetchStats(hospital_id);
  
  // 1. Safely extract the single stats object from the database array result
  const rawStats = statsArray && statsArray.length > 0 ? statsArray[0] : null;

  if (!rawStats) {
     generalResponse({
      res,
      data: {
        today_appointments: 0, appt_change: '0%',
        active_patients: 0, patients_change: '0%',
        revenue_today: '0.00', revenue_change: '0%',
        active_doctors: 0, doctors_change: '0%'
      },
      message: `No stats found for this hospital.`,
      statusCode: 200
    });
  }

  // 2. Map and compute percentage changes exactly as expected by public/js/stats.js
  const formattedStats = {
    today_appointments: rawStats.today_appointments,
    appt_change: calculatePercentageChange(rawStats.today_appointments, rawStats.yesterday_appointments),

    active_patients: rawStats.active_patients,
    patients_change: calculatePercentageChange(rawStats.active_patients, rawStats.patients_yesterday),

    revenue_today: rawStats.revenue_today, // Kept as string format "300.00" for your NumberFormatter on frontend
    revenue_change: calculatePercentageChange(rawStats.revenue_today, rawStats.revenue_yesterday),

    active_doctors: rawStats.active_doctors,
    doctors_change: calculatePercentageChange(rawStats.active_doctors, rawStats.doctors_yesterday)
  };

  // 3. Dispatch structured clean data back
  generalResponse({
    res,
    data: formattedStats,
    message: `Stats fetched and formatted successfully`,
    statusCode: 200
  });
});
}