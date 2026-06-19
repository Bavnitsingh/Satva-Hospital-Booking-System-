import {Router} from 'express'
import { Routes } from '../../common/interfaces/routes.interfaces.js'
import { DoctorPageController } from './doctor.page.controller.js';



export class DoctorPageRoutes implements Routes{
path='/doctor';
router=Router();
private page =new DoctorPageController()

constructor(){
    this.init()
}

private init():void{
    this.router.get("/dashboard",this.page.renderDashboard)
    this.router.get("/profile",this.page.renderProfile)
    this.router.get('/profile/edit',this.page.renderEditProfile)
    this.router.get("/login",this.page.renderDoctorLogin)

}
 
}