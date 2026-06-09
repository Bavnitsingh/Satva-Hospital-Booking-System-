import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { AdminController } from "./admin.controller.js";

export class AdminRoutes implements Routes{
 path: string = "/admin";
router: Router = Router();
  adminController = new AdminController();

    constructor() {
    this.initializationRoutes();
  }
  private initializationRoutes(): void {
    // use this way for
    // this.router.post('/register',middleware,this.contoller.register)
    this.router.get('/showdoctorspage',this.adminController.showDoctorsPage)
    this.router.get('/showDoctors',this.adminController.fetchDoctors)
    this.router.get('/showAddDoctorPage',this.adminController.showAddDoctorPage);

}

}