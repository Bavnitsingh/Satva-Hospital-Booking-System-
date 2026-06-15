import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { PatientController } from "./patient.controller.js";
import {
  authenticate,
  isPatient,
} from "../../common/middlewares/auth.middleware.js";
import { patientProfileAndInsuranceUpload } from "./utils/patientProfileandMulterUpload.js";
import { validate_body,validate_query } from "./middleware/patient.validate.js";
import {
  update_patient_profile_schema,
  add_family_member_schema,
  update_family_member_schema,
  search_doctors_schema,
  doctor_slots_schema,
  book_appointment_schema,
  reschedule_appointment_schema,
  cancel_appointment_schema,
  notification_query_schema,
} from "./validations/patient.validation.js";

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
    this.router.patch("/profile", patientProfileAndInsuranceUpload,  validate_body(update_patient_profile_schema),  this.patient.updateProfile);

    // Family members routes
    this.router.get("/family", this.patient.getFamilyMembers);
    this.router.post("/family",validate_body(add_family_member_schema), this.patient.addFamilyMember);
    this.router.patch("/family/:memberId", validate_body(update_family_member_schema), this.patient.updateFamilyMember);
    this.router.delete("/family/:memberId", this.patient.deleteFamilyMember);

    //  Doctor search routes
    this.router.get("/doctors", validate_query(search_doctors_schema), this.patient.searchDoctors);
    this.router.get("/doctors/slots",  validate_query(doctor_slots_schema),  this.patient.getAvailableSlots);
    this.router.get("/doctors/:doctorId", this.patient.getDoctorDetail);
    this.router.get("/appointments", this.patient.getAppointments);
    this.router.post("/appointments", validate_body(book_appointment_schema), this.patient.bookAppointment);

    this.router.patch(
      "/appointments/:appointmentId/reschedule",
      validate_body(reschedule_appointment_schema),
      this.patient.rescheduleAppointment,
    );

    this.router.patch(
      "/appointments/:appointmentId/cancel",
      validate_body(cancel_appointment_schema),
      this.patient.cancelAppointment,
    );

    // Payments 
    this.router.get("/payments", this.patient.getPaymentHistory);

    // Medical records 
    this.router.get("/records", this.patient.getMedicalHistory);
    this.router.get("/records/:recordId", this.patient.getMedicalRecord);

    // Notifications 
    this.router.get("/notifications", validate_query(notification_query_schema), this.patient.getNotifications);
    this.router.patch(
      "/notifications/:notificationId/read",
      this.patient.markNotificationRead,
    );
    this.router.patch(
      "/notifications/read-all",
      this.patient.markAllNotificationsRead,
    );

  }
}
