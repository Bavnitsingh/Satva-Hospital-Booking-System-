import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { PatientController } from "./patient.controller.js";
import {
  authenticate,
  isPatient,
} from "../../common/middlewares/auth.middleware.js";

export class PatientRoutes implements Routes {
  path = "/patient";
  router = Router();
  private patient = new PatientController();

  constructor() {
    this.init();
  }

  private init(): void {
    // patient routes require authentication + PATIENT role
    this.router.use(authenticate, isPatient);

    // ── Profile routes
    this.router.get("/profile", this.patient.getProfile);
    this.router.patch("/profile", this.patient.updateProfile);

    // ── Family members routes
    this.router.get("/family", this.patient.getFamilyMembers);
    this.router.post("/family", this.patient.addFamilyMember);
    this.router.patch("/family/:memberId", this.patient.updateFamilyMember);
    this.router.delete("/family/:memberId", this.patient.deleteFamilyMember);

    // ── Doctor search routes
    this.router.get("/doctors", this.patient.searchDoctors);
    this.router.get("/doctors/:doctorId", this.patient.getDoctorDetail);
  
  }
}
