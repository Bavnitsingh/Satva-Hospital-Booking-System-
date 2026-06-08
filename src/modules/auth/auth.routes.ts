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
    this.router.get("/send-otp-page",this.authContoller.listSendOtpPage);
    this.router.get("/show-email",this.authContoller.showMail);
    this.router.get("/enter-otp-page",this.authContoller.showEnterOtpPage)
    this.router.post("/sendOtp", this.authContoller.sendOtp);
    // this.router.post("/verifyOtp", this.authContoller.verifyOtp);
    this.router.post("/reset-password", this.authContoller.resetPassword);
    this.router.get("/forgot-password",(req, res)=>{res.render("auth/forgot-password-page")})
  }
}
