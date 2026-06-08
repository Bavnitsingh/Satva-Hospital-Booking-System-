import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { AuthController } from "./auth.controller.js";
import passport from './utils/googleauth.js'

export class AuthRoutes implements Routes {
  path: string = "/auth";
  router: Router = Router();
  authController = new AuthController();

  constructor() {
    this.initializationRoutes();
  }

  private initializationRoutes(): void {
    // use this way for
    // this.router.post('/register',middleware,this.contoller.register)
    this.router.post("/register-doctor", this.authController.registerDoctor);
    this.router.post("/register-admin", this.authController.registerAdmin);
    this.router.post("/register", this.authController.register);
    this.router.post("/login", this.authController.login);
    this.router.get('/google',passport.authenticate('google',{scope:[
        'profile',
        'email',
        //  'https://www.googleapis.com/auth/user.phonenumbers.read',
        //  'https://www.googleapis.com/auth/user.birthday.read',
        // 'https://www.googleapis.com/auth/user.gender.read',

    ]
    }))

this.router.get('/google/callback',passport.authenticate('google',{scope:['profile',
    'email',
    // 'https://www.googleapis.com/auth/user.phonenumbers.read'
],
successRedirect:'/dashboard'}
))


}
}
