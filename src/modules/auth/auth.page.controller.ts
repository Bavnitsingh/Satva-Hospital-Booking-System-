import { Request, Response } from "express";
export class AuthPageController {
  showLoginPage = async (req: Request, res: Response) => {
    try {
      res.render("auth/user_login");
    } catch (e) {
      throw e;
    }
  };

  showRegisterPage = async (req: Request, res: Response) => {
    try {
      res.render("auth/user_register");
    } catch (e) {
      throw e;
    }
  };

  showEnterOtpPage = async (req: Request, res: Response) => {
    try {
      res.render("auth/enter-otp-page");
    } catch (e) {
      throw e;
    }
  };

  SendOtpPage = async (req: Request, res: Response) => {
    try {
      res.render("auth/forgot-password-page")
    }
    catch (e) {
      throw e
    }
  }
}
