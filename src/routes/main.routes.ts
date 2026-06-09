import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes.js";
import { Routes } from "../common/interfaces/routes.interfaces.js";
import { PatientRoutes } from "../modules/patient/patient.routes.js";
import { AdminRoutes } from "../modules/admin/admin.routes.js";
import { PatientPageRoutes } from "../modules/patient/patient.page.routes.js";
import { DoctorRoutes } from "../modules/doctor/doctor.routes.js";


export function buildApiRouter():Router{

const router=Router()

const routes:Routes[]=[
    // add all routes here
    new AuthRoutes(),
    new PatientRoutes(),
    new AdminRoutes(),
    new PatientPageRoutes(),
    new DoctorRoutes()

]



routes.forEach((route)=>{
    router.use(route.path,route.router)
    
})


return router;
}





