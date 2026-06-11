import { Router } from "express";
import { AuthPageController } from "./auth.page.controller.js";

export class AuthPageRoutes {
  path = "/";
  router = Router();
  private page = new AuthPageController();

  constructor() {
    this.init();
  }

  private init(): void {
    // this.router.use(authenticate, isPatient);


    this.router.get(
      "/register",
      this.page.showRegisterPage
    );

    this.router.get(
      "/login",
      this.page.showLoginPage
    );

   this.router.get(
      "/enter-otp-page",
      this.page.showEnterOtpPage
    );

    this.router.get("/", (req, res) => {
      res.render("index")
    })




  }
}
