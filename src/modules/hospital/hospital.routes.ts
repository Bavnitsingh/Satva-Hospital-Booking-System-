import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { HospitalController } from "./hospital.controller.js";

export class HospitalRoutes implements Routes {
  path: string = "/hospital";
  router: Router = Router();
  hospitalController = new HospitalController();

  constructor() {
    this.initializationRoutes();
  }

  private initializationRoutes(): void {
    this.router.get("/list", this.hospitalController.getHospitalsList);

    this.router.get("/create-hospital", this.hospitalController.getCreateHospital);
    this.router.post("/create-hospital", this.hospitalController.postCreateHospital);
    
    this.router.get("/view-hospital/:id", this.hospitalController.getViewHospital);
    
    this.router.get("/edit-hospital/:id", this.hospitalController.getEditHospital);
    this.router.put("/edit-hospital/:id", this.hospitalController.putEditHospital);
  }
}
