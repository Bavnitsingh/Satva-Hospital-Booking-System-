import { Router } from "express";

export class AppointmentPageRoutes {
  public path = "/appointment";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Frontend UI Views Rendering
    this.router.get("/book", (req, res) => {
      res.render("patient/book-appointment", { title: "Book Appointment" });
    });
    
    this.router.get("/book/:id", (req, res) => {
      res.render("patient/book-appointment", { title: "Book Appointment" });
    });
    
    this.router.get("/my-appointments", (req, res) => {
      res.render("patient/my-appointments", { title: "Manage Appointments" });
    });
  }
}