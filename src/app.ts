import express, { Application, Express } from "express";
import path from "path";
import fs from "fs";
import { buildApiRouter } from "./routes/main.routes.js";
import passport from "./modules/auth/utils/googleauth.js";
import session from "express-session";
import { env } from "./config/index.js";
import cors from "cors"
import { fileURLToPath } from "url";
import { errorMiddleware } from "./common/middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import { PatientPageRoutes } from "./modules/patient/patient.page.routes.js";
import { AuthPageRoutes } from "./modules/auth/auth.page.routes.js";
import { DoctorPageRoutes } from "./modules/doctor/doctor.page.routes.js";
import { SuperAdminPageRoutes } from "./modules/super_admin/super.admin.page.routes.js";
import { HospitalPageRoutes } from "./modules/hospital/hospital.page.routes.js";
import { AdminPageRoutes } from "./modules/admin/admin.page.routes.js";
import { StaffPageRoutes } from "./modules/staff/staff.page.routes.js";


import { notFoundMiddleware } from "./common/middlewares/not-found.middlware.js";


export function buildApp(): Application {
  const app: Express = express();

  let __filePath = fileURLToPath(import.meta.url);
  let __dirname = path.dirname(__filePath);

  // 1. MUST BE FIRST: Apply CORS middleware globally before any processing happens
  app.use(cors({
    origin: [
      'http://localhost:5174' ,
      'http://localhost:5173'
    ], // Your exact React front-end URL
    credentials: true,               // Essential for authorization cookies/headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // 2. Parsers must run next to read incoming payloads
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // 3. CLEAN UP SESSIONS: Use only ONE session setup using your secure env secrets
  app.use(
    session({
      secret: env.SESSION_SECRET || "scret",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: false, // Set to true if using HTTPS in production
        httpOnly: true,
        sameSite: 'lax' // Helps cookies attach securely cross-origin in dev environments
      },
    }),
  );

  // 4. Initialize Auth modules
  app.use(passport.initialize());
  app.use(passport.session());

  // 5. Create Folders for File Uploads
  const parentpath = path.dirname(import.meta.dirname);
  const folderpath = path.join(parentpath, "uploads");

  if (!fs.existsSync(folderpath)) {
    fs.mkdirSync(folderpath);
    fs.mkdirSync(path.join(folderpath, "patient_profile"));
    fs.mkdirSync(path.join(folderpath, "doctor_profile"));
    fs.mkdirSync(path.join(folderpath, "medical_records"));
    console.log("Folders Created Successfully");
  }

  // 6. Mount Static Assertions and Templates
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(express.static(path.join(__dirname, "uploads")));
  app.use(express.static(path.join(__dirname, "../public")));
  app.use(express.static("public"));
  app.use("/uploads", express.static(path.join(parentpath, "uploads")));

  // 7. MOUNT API ROUTER FIRST (so your React app's fetch endpoints execute cleanly)
  app.use("/api/v1", buildApiRouter());

  // 8. Mount MVC Page/View Routers
  app.use('/admin', new AdminPageRoutes().router);
  app.use('/staff', new StaffPageRoutes().router);
  app.use('/super-admin', new SuperAdminPageRoutes().router);
  app.use('/hospital', new HospitalPageRoutes().router);
  app.use("/patient", new PatientPageRoutes().router);
  app.use('/doctor', new DoctorPageRoutes().router);
  app.use("/", new AuthPageRoutes().router);

  // 9. Standard EJS views
  app.get("/", (req, res) => { res.render("index"); });
  app.get("/about", (req, res) => { res.render("about"); });
  app.get("/contact", (req, res) => { res.render("contact"); });

  // 10. Fallbacks and Global error handlers must be last
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
