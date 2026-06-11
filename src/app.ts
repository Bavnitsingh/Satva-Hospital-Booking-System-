import express, { Application, Express } from "express";
import path from "path";
import fs from "fs";
import { buildApiRouter } from "./routes/main.routes.js";
import passport from "./modules/auth/utils/googleauth.js";
import session from "express-session";
import { env } from "./config/index.js";

import { fileURLToPath } from "url";
import { errorMiddleware } from "./common/middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import { PatientPageRoutes } from "./modules/patient/patient.page.routes.js";

export function buildApp(): Application {
  const app: Express = express();

  let __filePath = fileURLToPath(import.meta.url);
  let __dirname = path.dirname(__filePath);

  //configuring ejs settings ___________________________
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  app.use(express.static(path.join(__dirname, "upload")));
  app.use(express.static(path.join(__dirname, "../public")));

  // GLOBAL MIDDLEWARE
  app.use(express.json());
  app.use(
    session({
      secret: "scret",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
    }),
  );
  app.use(express.urlencoded({ extended: true }));

  app.use(express.static("public"));
  app.use(cookieParser());
  app.use(express.static("public"));

  // CREATE FOLDER FOR FILE UPLOADING
  const parentpath = path.dirname(import.meta.dirname);
  const folderpath = path.join(parentpath, "uploads");

  if (!fs.existsSync(folderpath)) {
    //uploads folder
    fs.mkdirSync(folderpath);
    //patient_profile folder
    const patient_profile = path.join(folderpath, "patient_profile");
    fs.mkdirSync(patient_profile);
    //doctor_profile folder
    const doctor_profile = path.join(folderpath, "doctor_profile");
    fs.mkdirSync(doctor_profile);
    // Add logic below for creating new folder
    console.log("Folder Created Successfully ");
  }

  //SESSION
  app.use(
    session({
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );
  console.log(path.join(__dirname, "views"));

  //
  app.use(passport.initialize());
  app.use(passport.session());
  app.use("/patient", new PatientPageRoutes().router);

  //ROUTER
  app.use("/api/v1", buildApiRouter());

  app.get("/", (req, res) => {
    res.render("index");
  });

  // HANDLES GLOBAL ERROR
  app.use(errorMiddleware);

  return app;
}
