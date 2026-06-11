import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { HospitalController } from "./hospital.controller.js";
import { validateRequestBody } from "../../common/middlewares/validation.middleware.js";
import {
  createHospitalSchema,
  updateHospitalSchema,
} from "./validators/hospital.validator.js";

export class HospitalRoutes implements Routes {
  path: string = "/hospital";
  router: Router = Router();
  hospitalController = new HospitalController();

  constructor() {
    this.initializationRoutes();
  }

  private initializationRoutes(): void {
    this.router.get("/list", this.hospitalController.getHospitalsList);

    this.router.get(
      "/create-hospital",
      this.hospitalController.getCreateHospital,
    );
    this.router.post(
      "/create-hospital",
      validateRequestBody(createHospitalSchema),
      this.hospitalController.postCreateHospital,
    );

    this.router.get(
      "/view-hospital/:id",
      this.hospitalController.getViewHospital,
    );

    this.router.get(
      "/edit-hospital/:id",
      this.hospitalController.getEditHospital,
    );
    this.router.put(
      "/edit-hospital/:id",
      validateRequestBody(updateHospitalSchema),
      this.hospitalController.putEditHospital,
    );
  }
}
