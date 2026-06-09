import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { AdminController } from "./admin.controller.js";
import { adminAuth } from "../../common/middlewares/auth.middleware.js";
import { uploadDoctorProfile } from "../../utils/multer.js";
import { profile } from "node:console";

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
    // this.router.use(adminAuth)
    this.router.get('/showdoctorspage',this.adminController.showDoctorsPage)
    this.router.get('/showpatientspage',this.adminController.showPatientsPage)
    this.router.get('/showDoctors',this.adminController.fetchDoctors)
    this.router.get('/showAddDoctorPage',this.adminController.showAddDoctorPage);
    this.router.post('/addDoctor',this.adminController.addDoctor);
}

}