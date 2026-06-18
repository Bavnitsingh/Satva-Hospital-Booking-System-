import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes.js";
import { Routes } from "../common/interfaces/routes.interfaces.js";
import { PatientRoutes } from "../modules/patient/patient.routes.js";
import { AdminRoutes } from "../modules/admin/admin.routes.js";
import { DoctorRoutes } from "../modules/doctor/doctor.routes.js";
import { TelemedicineRoutes } from "../modules/telemedicine/telemedicine.routes.js";
import { AppointmentRoutes } from "../modules/appointment/appointment.routes.js";
import { NotificationRouter } from "../modules/notification/notification.route.js";


export function buildApiRouter():Router{

const router=Router()

const routes:Routes[]=[
    // add all routes here
    new AuthRoutes(),
    new PatientRoutes(),
    new AdminRoutes(),
    new DoctorRoutes(),
    new TelemedicineRoutes(),
    new AppointmentRoutes(),
    new NotificationRouter(),

]

routes.forEach((route)=>{
    router.use(route.path,route.router)
})


return router;
}
