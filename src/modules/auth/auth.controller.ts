import { Request, Response } from "express";
import { catchAsync } from "../../common/helpers/catch-async.js";
import { generalResponse } from "../../common/helpers/general-response.js";
import { AuthService } from "./auth.service.js";
import { HttpException } from "../../common/helpers/http-exception.js";

export class AuthController {
  private authService = new AuthService();

  //SERVING STATIC PAGES

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

  login = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken, ...data } = await this.authService.login(req.body);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    generalResponse({
      res,
      data: data,
      message: "Logged in Successfully",
      statusCode: 200,
    });
  });

  registerDoctor = catchAsync(async (req: Request, res: Response) => {
    const result = await this.authService.registerDoctor(req.body);

    generalResponse({
      res,
      data: result,
      message: "Doctor Registration Successful",
      statusCode: 201,
    });
  });

  registerAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await this.authService.registerAdmin(req.body);

    generalResponse({
      res,
      data: result,
      message: "Admin Registration Successful",
      statusCode: 201,
    });
  });

  register = catchAsync(async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);
    generalResponse({
      res,
      data: result,
      message: "Registration Successfull",
      statusCode: 201,
    });
  });
  listSendOtpPage = async (req: Request, res: Response) => {
    try {
      res.render("auth/forgot-password-page");
    } catch (e) {
      throw e;
    }
  };

  showMail = async (req: Request, res: Response) => {
    try {
      if (!req.session.isEmailVerified || !req.session.email) {
        return res.redirect("/api/v1/auth/forgot-password-page");
      }

      const otp = await this.authService.getLatestOtpService(req.session.email);

      console.log("hdasfds", otp);
      if (!otp) {
        return res.redirect("api/v1/auth/forgot-password-page");
      }

      console.log("OTP to show:", otp);
      return res.render("auth/show-email", { otp_code: otp });
    } catch (e) {
      console.log(e);
      return generalResponse({
        res,
        data: null,
        message: "Failed to load OTP page",
        statusCode: 500,
      });
    }
  };
  showEnterOtpPage = async (req: Request, res: Response) => {
    if (!req.session.email) {
      return res.redirect("/forgot-password-page.ejs");
    }
    return res.render("auth/enter-otp-page");
  };

  sendOtp = async (req: Request, res: Response) => {
    const email = req.body.email;
    if (!email)
      return generalResponse({
        res,
        message: "Email required",
        statusCode: 400,
      });

    const response = await this.authService.getOtp(email);

    req.session.isEmailVerified = true;
    req.session.email = email;
    req.session.user_id = response.data.user_id;

    return generalResponse({
      res,
      message: "OTP sent successfully",
      statusCode: 200,
    });
  };

  verifyOtp = async (email: string, otp: string) => {
    let response = await this.authService.verifyOtp(email, otp);
    // req.session.isOtpVerified = true;

    return response.success;
    // catch (e) {
    //     console.log(e);
    //     let error = e instanceof Error ? e.message : "error in registring user";
    //     return sendResponse(res, 400, "Failed to vefiy otp", error);
    // }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      let { otp, newPassword } = req.body;

      let user_id = req.session.user_id as number;

      let email = req.session.email as string;
      let response = await this.verifyOtp(email, otp);
      if (response) {
        let isReset = await this.authService.resetPassword(
          newPassword,
          user_id,
        );

        req.session.isEmailVerified = false;

        if (isReset) {
          return generalResponse({
            res,
            data: null,
            message: "password hasbeen changed Successfully!!",
            statusCode: 200,
          });
        } else {
          return generalResponse({
            res,
            data: null,
            message: "password hasbeen changed Successfully!!",
            statusCode: 200,
          });
        }
      } else {
        req.session.isEmailVerified = false;

        return generalResponse({
          res,
          data: null,
          message: "Incorrect Otp",
          statusCode: 400,
        });
      }
    } catch (e) {
      console.log(e);
      let error = e instanceof Error ? e.message : "error in registring user";
      const status = e instanceof HttpException ? e.statusCode : 400;
      return generalResponse({
        res,
        data: status,
        message: "Failed to send otp",
        statusCode: 400,
      });
    }
  };
}
