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
    logger.info(result)
    generalResponse({ res, data: result, message: "Profile fetched" });
  });

  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.updateProfile((req as AuthRequest).user.id, req.body);
    generalResponse({ res, data: result, message: "Profile updated" });
  });

  // Family
  getFamilyMembers = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.getFamilyMembers((req as AuthRequest).user.id);
    generalResponse({ res, data: result, message: "Family members fetched" });
  });

  addFamilyMember = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.addFamilyMember((req as AuthRequest).user.id, req.body);
    generalResponse({ res, data: result, message: "Family member added", statusCode: 201 });
  });

  updateFamilyMember = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.updateFamilyMember(
      (req as AuthRequest).user.id,
      Number(req.params.memberId),
      req.body
    );
    generalResponse({ res, data: result, message: "Family member updated" });
  });

  deleteFamilyMember = catchAsync(async (req: Request, res: Response) => {
    await this.service.deleteFamilyMember(
      (req as AuthRequest).user.id,
      Number(req.params.memberId)
    );
    generalResponse({ res, data: null, message: "Family member removed" });
  });

  // Doctor search
  searchDoctors = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.searchDoctors(req.query as any);
    generalResponse({ res, data: result, message: "Doctors fetched" });
  });

  getDoctorDetail = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.getDoctorDetail(Number(req.params.doctorId));
    generalResponse({ res, data: result, message: "Doctor fetched" });
  });



}