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
    generalResponse({
      res,
      data: result,
      message: "Profile fetched",
      statusCode: 200,
    });
  });

updateProfile = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as any;
  const body = req.body;

  const profileImage = files?.profile_upload?.[0];
  const policyDocument = files?.policy_document?.[0];

  if (profileImage) {
    body.profile_path = profileImage.path;
  }

  if (policyDocument) {
    body.policy_document_path = policyDocument.path;
  }

  const result = await this.service.updateProfile(
    (req as AuthRequest).user.id,
    body,
  );

  generalResponse({
    res,
    data: result,
    message: "Profile updated",
    statusCode: 200,
  });
});

  // Family
  getFamilyMembers = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.getFamilyMembers(
      (req as AuthRequest).user.id,
    );
    generalResponse({
      res,
      data: result,
      message: "Family members fetched",
      statusCode: 200,
    });
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
    generalResponse({
      res,
      data: result,
      message: "Family member updated",
      statusCode: 200,
    });
  });

  deleteFamilyMember = catchAsync(async (req: Request, res: Response) => {
    await this.service.deleteFamilyMember(
      (req as AuthRequest).user.id,
      Number(req.params.memberId),
    );
    generalResponse({
      res,
      data: null,
      message: "Family member removed",
      statusCode: 200,
    });
  });

  // Doctor search
  searchDoctors = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.searchDoctors(req.query as any);
    generalResponse({
      res,
      data: result,
      message: "Doctors fetched",
      statusCode: 200,
    });
  });

  getDoctorDetail = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.getDoctorDetail(
      Number(req.params.doctorId),
    );
    generalResponse({
      res,
      data: result,
      message: "Doctor fetched",
      statusCode: 200,
    });
  });

  // Appointments
  getAppointments = catchAsync(async (req: Request, res: Response) => {
    const { status } = req.query as { status?: string };
    const result = await this.service.getAppointments(
      (req as AuthRequest).user.id,
      status,
    );
    generalResponse({
      res,
      data: result,
      message: "Appointments fetched",
      statusCode: 200,
    });
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
    generalResponse({
      res,
      data: result,
      message: "Appointment rescheduled",
      statusCode: 200,
    });
  });

  cancelAppointment = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.cancelAppointment(
      (req as AuthRequest).user.id,
      Number(req.params.appointmentId),
      req.body.reason,
    );
    generalResponse({
      res,
      data: result,
      message: "Appointment cancelled",
      statusCode: 200,
    });
  });

  // Payments

  getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.getPaymentHistory(
      (req as AuthRequest).user.id,
    );
    generalResponse({
      res,
      data: result,
      message: "Payment history fetched",
      statusCode: 200,
    });
  });

  // Medical records
  getMedicalHistory = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.getMedicalHistory(
      (req as AuthRequest).user.id,
    );
    generalResponse({
      res,
      data: result,
      message: "Medical history fetched",
      statusCode: 200,
    });
  });

  getMedicalRecord = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.getMedicalRecord(
      (req as AuthRequest).user.id,
      Number(req.params.recordId),
    );
    generalResponse({
      res,
      data: result,
      message: "Medical record fetched",
      statusCode: 200,
    });
  });

  // Notifications
  getNotifications = catchAsync(async (req: Request, res: Response) => {
    const unreadOnly = req.query.unread === "true";
    const result = await this.service.getNotifications(
      (req as AuthRequest).user.id,
      unreadOnly,
    );
    generalResponse({
      res,
      data: result,
      message: "Notifications fetched",
      statusCode: 200,
    });
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
      statusCode: 200,
    });
  });

  markAllNotificationsRead = catchAsync(async (req: Request, res: Response) => {
    await this.service.markAllNotificationsRead((req as AuthRequest).user.id);
    generalResponse({
      res,
      data: null,
      message: "All notifications marked as read",
      statusCode: 200,
    });
  });

  getAvailableSlots = catchAsync(async (req: Request, res: Response) => {
    const { doctorId, date } = req.query as { doctorId: string; date: string };
    if (!doctorId || !date)
      throw new Error("doctorId and date (YYYY-MM-DD) are required");
    const result = await this.service.getAvailableSlots(Number(doctorId), date);
    generalResponse({
      res,
      data: result,
      message: "Available slots",
      statusCode: 200,
    });
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
