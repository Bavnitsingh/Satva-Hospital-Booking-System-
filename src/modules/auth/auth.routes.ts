import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { AuthController } from "./auth.controller.js";
import passport from './utils/googleauth.js'

export class AuthRoutes implements Routes {
  path: string = "/auth";
  router: Router = Router();
  authController = new AuthController();

  constructor() {
    this.initializationRoutes();
  }

  private initializationRoutes(): void {

    //SERVING STATIC PAGES

    this.router.get(
      "/register-page",
      this.authController.showRegisterPage
    );

    this.router.get(
      "/login-page",
      this.authController.showLoginPage
    );

    this.router.get(
      "/enter-otp-page",
      this.authController.showEnterOtpPage
    );


    this.router.post("/register-doctor", this.authController.registerDoctor);
    this.router.post("/register-admin", this.authController.registerAdmin);
    this.router.post("/register", this.authController.register);
    this.router.post("/login", this.authController.login);
    this.router.get("/send-otp-page", this.authController.listSendOtpPage);
    this.router.get("/show-email", this.authController.showMail);
    this.router.get("/enter-otp-page", this.authController.showEnterOtpPage);
    this.router.post("/sendOtp", this.authController.sendOtp);
    this.router.post("/reset-password", this.authController.resetPassword);
    this.router.get("/forgot-password", (req, res) => { res.render("auth/forgot-password-page") })
    this.router.get('/google', passport.authenticate('google', {
      scope: [
        'profile',
        'email',
        //  'https://www.googleapis.com/auth/user.phonenumbers.read',
        //  'https://www.googleapis.com/auth/user.birthday.read',
        // 'https://www.googleapis.com/auth/user.gender.read',

      ]
    }))

    this.router.get('/google/callback', passport.authenticate('google', {
      scope: ['profile',
        'email',
        // 'https://www.googleapis.com/auth/user.phonenumbers.read'
      ],
      successRedirect: '/api/v1/patient/dashboard'
    }
    ))


  }
}
