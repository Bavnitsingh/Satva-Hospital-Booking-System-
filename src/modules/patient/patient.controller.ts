import { Request, Response } from "express";
import { catchAsync } from "../../common/helpers/catch-async.js";
import { generalResponse } from "../../common/helpers/general-response.js";
import { PatientService } from "./patient.service.js";
import { AuthRequest } from "../../common/middlewares/auth.middleware.js";
import logger from "../../common/logger.js";

export class PatientController {
  private service = new PatientService();

  // Profile
  getProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.getProfile((req as AuthRequest).user.id);
    logger.info(result);
    generalResponse({ res, data: result, message: "Profile fetched" });
  });

  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.updateProfile(
      (req as AuthRequest).user.id,
      req.body,
    );
    generalResponse({ res, data: result, message: "Profile updated" });
  });

  // Family
  getFamilyMembers = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.getFamilyMembers(
      (req as AuthRequest).user.id,
    );
    generalResponse({ res, data: result, message: "Family members fetched" });
  });

  addFamilyMember = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.addFamilyMember(
      (req as AuthRequest).user.id,
      req.body,
    );
    generalResponse({
      res,
      data: result,
      message: "Family member added",
      statusCode: 201,
    });
  });

  updateFamilyMember = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.updateFamilyMember(
      (req as AuthRequest).user.id,
      Number(req.params.memberId),
      req.body,
    );
    generalResponse({ res, data: result, message: "Family member updated" });
  });

  deleteFamilyMember = catchAsync(async (req: Request, res: Response) => {
    await this.service.deleteFamilyMember(
      (req as AuthRequest).user.id,
      Number(req.params.memberId),
    );
    generalResponse({ res, data: null, message: "Family member removed" });
  });

  // Doctor search
  searchDoctors = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.searchDoctors(req.query as any);
    generalResponse({ res, data: result, message: "Doctors fetched" });
  });

  getDoctorDetail = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.getDoctorDetail(
      Number(req.params.doctorId),
    );
    generalResponse({ res, data: result, message: "Doctor fetched" });
  });

  // Appointments
  getAppointments = catchAsync(async (req: Request, res: Response) => {
    const { status } = req.query as { status?: string };
    const result = await this.service.getAppointments(
      (req as AuthRequest).user.id,
      status,
    );
    generalResponse({ res, data: result, message: "Appointments fetched" });
  });

  bookAppointment = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.bookAppointment(
      (req as AuthRequest).user.id,
      req.body,
    );
    generalResponse({
      res,
      data: result,
      message: "Appointment booked",
      statusCode: 201,
    });
  });

  rescheduleAppointment = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.rescheduleAppointment(
      (req as AuthRequest).user.id,
      Number(req.params.appointmentId),
      req.body,
    );
    generalResponse({ res, data: result, message: "Appointment rescheduled" });
  });

  cancelAppointment = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.cancelAppointment(
      (req as AuthRequest).user.id,
      Number(req.params.appointmentId),
      req.body.reason,
    );
    generalResponse({ res, data: result, message: "Appointment cancelled" });
  });

  // Payments

  getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.getPaymentHistory(
      (req as AuthRequest).user.id,
    );
    generalResponse({ res, data: result, message: "Payment history fetched" });
  });

  // Medical records
  getMedicalHistory = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.getMedicalHistory(
      (req as AuthRequest).user.id,
    );
    generalResponse({ res, data: result, message: "Medical history fetched" });
  });

  getMedicalRecord = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.getMedicalRecord(
      (req as AuthRequest).user.id,
      Number(req.params.recordId),
    );
    generalResponse({ res, data: result, message: "Medical record fetched" });
  });

  // Notifications
  getNotifications = catchAsync(async (req: Request, res: Response) => {
    const unreadOnly = req.query.unread === "true";
    const result = await this.service.getNotifications(
      (req as AuthRequest).user.id,
      unreadOnly,
    );
    generalResponse({ res, data: result, message: "Notifications fetched" });
  });

  markNotificationRead = catchAsync(async (req: Request, res: Response) => {
    await this.service.markNotificationRead(
      (req as AuthRequest).user.id,
      Number(req.params.notificationId),
    );
    generalResponse({
      res,
      data: null,
      message: "Notification marked as read",
    });
  });

  markAllNotificationsRead = catchAsync(async (req: Request, res: Response) => {
    await this.service.markAllNotificationsRead((req as AuthRequest).user.id);
    generalResponse({
      res,
      data: null,
      message: "All notifications marked as read",
    });
  });

  getAvailableSlots = catchAsync(async (req: Request, res: Response) => {
    const { doctorId, date } = req.query as { doctorId: string; date: string };
    if (!doctorId || !date)
      throw new Error("doctorId and date (YYYY-MM-DD) are required");
    const result = await this.service.getAvailableSlots(Number(doctorId), date);
    generalResponse({ res, data: result, message: "Available slots" });
  });






// showProfile=catchAsync(async(req:Request,res:Response)=>{

// const result= await this.patientService.showProfile(Number(req.params.user_id))

// generalResponse({res,data:result,message:'Profile Fetched Successfully',statusCode:200})
// })

// updateProfile=catchAsync(async(req:Request,res:Response)=>{

//     const result=await this.patientService.updateProfile(req.body,Number(req.params.user_id))

//     generalResponse({res,data:[],message:'Profile Update Successfully',statusCode:200})
// })



// updateProfilePicture=catchAsync(async(req:Request,res:Response)=>{

//     const destination=req.file?.destination || 'uploads/patient_profile/default.png'

//     const result =await this.patientService.updatePatientProfile(Number(req.params.user_id),destination)

//     generalResponse({res,data:[],message:'Profile Image successfully',statusCode:201})

// })

}