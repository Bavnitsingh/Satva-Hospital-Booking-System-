import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { AdminController } from "./admin.controller.js";
import { adminAuth } from "../../common/middlewares/auth.middleware.js";


export class AdminRoutes implements Routes {
  path: string = "/admin";
  router: Router = Router();
  adminController = new AdminController();

  constructor() {
    this.initializationRoutes();
  }
  private initializationRoutes(): void {
    // use this way for
    // this.router.post('/register',middleware,this.contoller.register)
    this.router.use(adminAuth)
    this.router.get('/showDoctors', this.adminController.fetchDoctors);
    this.router.post('/addDoctor', this.adminController.addDoctor);
    this.router.get('/doctors/:doctorId', this.adminController.viewDoctor);
    this.router.get('/fetchpatients', this.adminController.fetchPatients)
    this.router.put('/doctors/:doctorId', this.adminController.editDoctor);
    this.router.get('/fetchAppointments', this.adminController.fetchAppointments);
    this.router.get('/fetchAuditLogs', this.adminController.fetchAuditLogs);
    this.router.get('/fetchSpecialties', this.adminController.fetchSpecialties);
    this.router.put('/toggleDoctorStatus/:id', this.adminController.toggleDoctorStatus);
  }

}