import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { AuthController } from "./auth.controller.js";

export class AuthRoutes implements Routes {
  path: string = "/auth";
  router: Router = Router();
  authContoller = new AuthController();

  constructor() {
    this.initializationRoutes();
  }

  private initializationRoutes(): void {
    // use this way for
    // this.router.post('/register',middleware,this.contoller.register)

    this.router.post("/register", this.authContoller.register);
    this.router.post("/login", this.authContoller.login);
  }
}
