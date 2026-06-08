import express, { Application, Express } from "express";
import path from "path";
import fs from 'fs'
import {buildApiRouter} from "./routes/main.routes.js";
import passport from './modules/auth/utils/googleauth.js'
import session from 'express-session'
import { env } from "./config/index.js";


export function buildApp(): Application {
  const app: Express = express();

  // APP SETTING
  app.set("view engine", "ejs");
  app.set("views", path.join(import.meta.dirname, "views"));


  // GLOBAL MIDDLEWARE
  app.use(express.json());
  app.use(express.urlencoded({extended:true}))
  app.use(express.static("public"))


  // CREATE FOLDER FOR FILE UPLOADING 
  const parentpath=path.dirname(import.meta.dirname)
  const folderpath=path.join(parentpath,'uploads')


  if(!fs.existsSync(folderpath)){
    //uploads folder
    fs.mkdirSync(folderpath)
    //patient_profile folder
    const patient_profile=path.join(folderpath,'patient_profile')
    fs.mkdirSync(patient_profile)
    //doctor_profile folder 
    const doctor_profile=path.join(folderpath,'doctor_profile')
    fs.mkdirSync(doctor_profile)
    // Add logic below for creating new folder 
    console.log('Folder Created Successfully ')
  }



  //SESSION 
  app.use(
    session({
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
       
    })
);



  //
  app.use(passport.initialize());
app.use(passport.session());

  //ROUTER 
  app.use("/api/v1",buildApiRouter())
  
  return app;
}
