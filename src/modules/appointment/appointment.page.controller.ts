import { Request, Response } from "express";

export class AppointmentPageController {
  renderBookAppointment = (req: Request, res: Response) => {
    res.render("appointment/book-appointment", { user: (req as any).user });
  };

  renderAppointmentsList = (req: Request, res: Response) => {
    res.render("appointment/my-appointments", { user: (req as any).user });
  };
}
