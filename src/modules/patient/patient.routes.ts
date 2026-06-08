import { Router } from "express";
import { PatientController } from "./patient.controller.js";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { uploadPatientProfile } from "../../utils/multer.js";



export class PatientRoutes implements Routes{
    path:string='/patient';
    router:Router=Router()
    patientController=new PatientController()

     constructor() {
    this.initializationRoutes();
  }

  private initializationRoutes(): void {
    this.router.get('/profile',this.patientController.profilePage)
    
    this.router.get('/show-profile/:user_id',this.patientController.showProfile)


    this.router.put('/update-profile/:user_id',this.patientController.updateProfile)
    this.router.post('/update-profile-picture/:user_id',uploadPatientProfile.single('profile_img'),this.patientController.updateProfilePicture)
    

}
}