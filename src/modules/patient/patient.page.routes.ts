import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { PatientPageController } from "./patient.page.controller.js";
import { authenticate, isPatient } from "../../common/middlewares/auth.middleware.js";

export class PatientPageRoutes implements Routes {
  path = "/patient";
  router = Router();
  private page = new PatientPageController();

  constructor() {
    this.init();
  }

  private init(): void {
    // this.router.use(authenticate, isPatient);

    this.router.get("/dashboard", this.page.renderDashboard);
    this.router.get("/profile", this.page.renderProfile);
    this.router.get("/doctors", this.page.renderDoctors);
    this.router.get("/appointments", this.page.renderAppointments);
    this.router.get("/notifications", this.page.renderNotifications);
    this.router.get("/payments", this.page.renderPayments);
    this.router.get("/records", this.page.renderRecords);
  }
}