import { Request, Response } from "express";

export class PatientPageController {
  renderDashboard = (req: Request, res: Response) => {
    res.render("patient/patient-dashboard", { user: (req as any).user });
  };

  renderProfile = (req: Request, res: Response) => {
    res.render("patient/patient-profile-update", { user: (req as any).user });
  };

  renderDoctors = (req: Request, res: Response) => {
    res.render("patient/doctors", { user: (req as any).user });
  };

  renderAppointments = (req: Request, res: Response) => {
    res.render("patient/book-appointment", { user: (req as any).user });
  };

  renderNotifications = (req: Request, res: Response) => {
    res.render("patient/notifications", { user: (req as any).user });
  };

  renderPayments = (req: Request, res: Response) => {
    res.render("patient/payments", { user: (req as any).user });
  };

  renderRecords = (req: Request, res: Response) => {
    res.render("patient/records", { user: (req as any).user });
  };
}