import { Request, Response } from "express";
import { catchAsync } from "../../common/helpers/catch-async.js";
import { generalResponse } from "../../common/helpers/general-response.js";
import { SuperAdminService } from "./super.admin.service.js";

export class SuperAdminController {
  private superAdminService = new SuperAdminService();

  getLogin = catchAsync(async (req: Request, res: Response) => {
    return res.status(200).render("super_admin/super_login");
  });

  postLogin = catchAsync(async (req: Request, res: Response) => {
    try {
      const result = await this.superAdminService.login(req.body);
      generalResponse({
        res,
        data: result,
        message: "Logged in Successfully",
        statusCode: 200,
      });
    } catch (error) {
      generalResponse({
        res,
        data: error,
        message: `${error instanceof Error ? error.message : "Error"}`,
        statusCode:
          error instanceof Error
            ? ((error.cause as { status?: number })?.status ?? 500)
            : 500,
      });
    }
  });

  seedSuperAdmin = catchAsync(async (req: Request, res: Response) => {
    try {
      const result = await this.superAdminService.seed(req.body);
      generalResponse({
        res,
        data: result,
        message: "Super Admin created",
        statusCode: 201,
      });
    } catch (error) {
      generalResponse({
        res,
        data: error,
        message: `${error instanceof Error ? error.message : "Error while seeding super admin"}`,
        statusCode: 500,
      });
    }
  });

  dashboard = catchAsync(async (req: Request, res: Response) => {
    return res.render("super_admin/dashboard");
  });
}
