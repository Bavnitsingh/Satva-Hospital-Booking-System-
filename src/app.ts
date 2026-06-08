import express, { Application, Express } from "express";
import path from "path";
import { buildApiRouter } from "./routes/main.routes.js";
import { fileURLToPath } from "url";
import session from "express-session";

export function buildApp(): Application {
  const app: Express = express();

  let __filePath = fileURLToPath(import.meta.url);
  let __dirname = path.dirname(__filePath);

  //configuring ejs settings ___________________________
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));


  app.use(express.static(path.join(__dirname, 'upload')));
  app.use(express.static(path.join(__dirname, '../public')));

  // GLOBAL MIDDLEWARE
  app.use(express.json());
  app.use(
    session({ secret: 'scret', resave: false, saveUninitialized: true, cookie: { secure: false } }),
  );
  app.use(express.urlencoded({ extended: true }));

  app.use(express.static("public"))

  //ROUTER 
  app.use("/api/v1", buildApiRouter())

  return app;
}
