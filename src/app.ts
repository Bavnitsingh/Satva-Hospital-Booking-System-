import express, { Application, Express } from "express";
import path from "path";
import {buildApiRouter} from "./routes/main.routes.js";

export function buildApp(): Application {
  const app: Express = express();

  // APP SETTING
  app.set("view engine", "ejs");
  app.set("views", path.join(import.meta.dirname, "views"));


  // GLOBAL MIDDLEWARE
  app.use(express.json());
  app.use(express.urlencoded({extended:true}))
  app.use(express.static("public"))

  //ROUTER 
  app.use("/api/v1",buildApiRouter())

  return app;
}
