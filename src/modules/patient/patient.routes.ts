import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { PatientController } from "./patient.controller.js";
import {
  authenticate,
  isPatient,
} from "../../common/middlewares/auth.middleware.js";
import { patientProfileAndInsuranceUpload } from "./utils/patientProfileandMulterUpload.js";

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

    // Profile routes
    this.router.get("/profile", this.patient.getProfile);
    this.router.patch("/profile", patientProfileAndInsuranceUpload, this.patient.updateProfile);

    // Family members routes
    this.router.get("/family", this.patient.getFamilyMembers);
    this.router.post("/family", this.patient.addFamilyMember);
    this.router.patch("/family/:memberId", this.patient.updateFamilyMember);
    this.router.delete("/family/:memberId", this.patient.deleteFamilyMember);

    //  Doctor search routes
    this.router.get("/doctors", this.patient.searchDoctors);
    this.router.get("/doctors/slots", this.patient.getAvailableSlots);
    this.router.get("/doctors/:doctorId", this.patient.getDoctorDetail);
    this.router.get("/appointments", this.patient.getAppointments);
    this.router.post("/appointments", this.patient.bookAppointment);

    this.router.patch(
      "/appointments/:appointmentId/reschedule",
      this.patient.rescheduleAppointment,
    );

    this.router.patch(
      "/appointments/:appointmentId/cancel",
      this.patient.cancelAppointment,
    );

    // Payments
    this.router.get("/payments", this.patient.getPaymentHistory);

    // Medical records
    this.router.get("/records", this.patient.getMedicalHistory);
    this.router.get("/records/:recordId", this.patient.getMedicalRecord);

    // Notifications
    this.router.get("/notifications", this.patient.getNotifications);

    this.router.patch(
      "/notifications/:notificationId/read",
      this.patient.markNotificationRead,
    );

    this.router.patch(
      "/notifications/read-all",
      this.patient.markAllNotificationsRead,
    );

    this.router.delete("/family/:memberId", this.patient.deleteFamilyMember);
  }
}
