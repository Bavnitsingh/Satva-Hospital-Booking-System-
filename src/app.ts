import express, { Application, Express } from "express";
import path from "path";
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
