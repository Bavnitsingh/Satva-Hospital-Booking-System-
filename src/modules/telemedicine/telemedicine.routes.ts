import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { TelemedicineController } from "./telemedicine.controller.js";
import { doctorAuth } from "../../common/middlewares/auth.middleware.js";

export class TelemedicineRoutes implements Routes {
  path: string = "/telemedicine";
  router: Router = Router();
  telemedicineController = new TelemedicineController();

  constructor() {
    this.init();
  }

  private init(): void {
    // Create a telemedicine session
    this.router.post(
      "/",
      doctorAuth,
      this.telemedicineController.createTelemedicineSession
    );

    // Get a session by session ID
    this.router.get(
      "/:sessionId",
      doctorAuth,
      this.telemedicineController.getTelemedicineSessionById
    );

    // Get a session by appointment ID
    this.router.get(
      "/appointment/:appointmentId",
      doctorAuth,
      this.telemedicineController.getTelemedicineSessionByAppointmentId
    );

    // Get all sessions for a patient
    this.router.get(
      "/patient/:patientId",
      doctorAuth,
      this.telemedicineController.getTelemedicineSessionsByPatientId
    );

    // Get all sessions for a doctor
    this.router.get(
      "/doctor/:doctorId",
      doctorAuth,
      this.telemedicineController.getTelemedicineSessionsByDoctorId
    );

    // Start a session
    this.router.patch(
      "/:sessionId/start",
      doctorAuth,
      this.telemedicineController.startTelemedicineSession
    );

    // End a session
    this.router.patch(
      "/:sessionId/end",
      doctorAuth,
      this.telemedicineController.endTelemedicineSession
    );

    // Update session status
    this.router.patch(
      "/:sessionId/status",
      doctorAuth,
      this.telemedicineController.updateTelemedicineSessionStatus
    );

    // Update meeting link
    this.router.patch(
      "/:sessionId/meeting-link",
      doctorAuth,
      this.telemedicineController.updateTelemedicineMeetingLink
    );
  }
}