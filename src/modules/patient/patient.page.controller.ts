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

  renderBookAppointment = (req: Request, res: Response) => {
    res.render("patient/book-appointment", { user: (req as any).user });
  };

  renderNotifications = (req: Request, res: Response) => {
    res.render("patient/notifications", { user: (req as any).user });
  };

  renderPayments = (req: Request, res: Response) => {
    res.render("patient/payments", { user: (req as any).user });
  };

  renderRecords = (req: Request, res: Response) => {
    res.render("patient/my-records", { user: (req as any).user });
  };
  renderRecordDetails = (req: Request, res: Response) => {
    res.render("patient/record-details", {
      user: (req as any).user,
      recordId: req.params.recordId,
    });
  };
  renderPatientAppointments = (req: Request, res: Response) => {
    res.render("patient/my-appointments", { user: (req as any).user });
  };
}
