import { Router } from "express";
import { AppointmentController } from "./appointment.controller.js";
import { authenticate, patientAuth, doctorAuth } from "../../common/middlewares/auth.middleware.js";

export class AppointmentRoutes {
  public path = "/appointments";
  public router = Router();
  private controller = new AppointmentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Common logged in users
    this.router.get("/slots", authenticate, this.controller.getAvailableSlots);

    // Patient routes
    this.router.post("/", patientAuth, this.controller.bookAppointment);
    this.router.get("/patient", patientAuth, this.controller.getAppointments);
    this.router.patch("/:id/reschedule", patientAuth, this.controller.rescheduleAppointment);
    this.router.patch("/:id/cancel", patientAuth, this.controller.cancelAppointment);

    // Doctor routes
    this.router.get("/doctor/today", doctorAuth, this.controller.getDoctorTodaysAppointments);
    this.router.get("/doctor/dashboard", doctorAuth, this.controller.getDoctorDashboardData);
  }
}