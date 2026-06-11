import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { SuperAdminController } from "./super.admin.controller.js";
import { validateRequestBody } from "./middlewares/validation.middleware.js";
import {
  createAdminSchema,
  loginSchema,
  seedSuperAdminSchema,
  updateAdminSchema,
} from "./validators/superadmin.crud.validations.js";

export class SuperAdminRoutes implements Routes {
  path: string = "/super-admin";
  router: Router = Router();
  superAdminController = new SuperAdminController();

  constructor() {
    this.initializationRoutes();
  }

  private initializationRoutes(): void {
    this.router.get("/login", this.superAdminController.getLogin);
    this.router.post(
      "/login",
      validateRequestBody(loginSchema),
      this.superAdminController.postLogin,
    );
    this.router.post(
      "/seed-super-admin",
      validateRequestBody(seedSuperAdminSchema),
      this.superAdminController.seedSuperAdmin,
    );
    this.router.get("/dashboard", this.superAdminController.dashboard);

    this.router.get("/list", this.superAdminController.getAdminsList);

    // Admin CRUD routes
    this.router.get("/create-admin", this.superAdminController.getCreateAdmin);
    this.router.post(
      "/create-admin",
      validateRequestBody(createAdminSchema),
      this.superAdminController.postCreateAdmin,
    );

    this.router.get("/view-admin/:id", this.superAdminController.getViewAdmin);

    this.router.get("/edit-admin/:id", this.superAdminController.getEditAdmin);
    this.router.put(
      "/edit-admin/:id",
      validateRequestBody(updateAdminSchema),
      this.superAdminController.putEditAdmin,
    );
  }
}
